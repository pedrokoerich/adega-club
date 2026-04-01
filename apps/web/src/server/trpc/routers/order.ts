import { z } from "zod";
import { router, protectedProcedure, sellerProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const orderRouter = router({
  // Buyer: create order (buy now)
  create: protectedProcedure
    .input(
      z.object({
        listingId: z.string().uuid(),
        quantity: z.number().int().min(1),
        shippingAddressId: z.string().uuid(),
        shippingMethod: z.enum(["SELLER_SHIPS", "PLATFORM_SHIPS", "FREIGHTER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buyerId = ctx.user.id;

      // Get listing
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { seller: { include: { sellerProfile: true } } },
      });
      if (!listing || listing.status !== "ACTIVE") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not available" });
      }
      if (listing.sellerId === buyerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot buy your own listing" });
      }
      if (input.quantity > listing.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
      }

      // Verify address exists
      const address = await ctx.db.address.findFirst({
        where: { id: input.shippingAddressId, userId: buyerId },
      });
      if (!address) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Address not found" });
      }

      // Calculate amounts
      const subtotalUsd = Number(listing.priceUsd) * input.quantity;
      const commissionRate = listing.seller.sellerProfile
        ? Number(listing.seller.sellerProfile.commissionRate)
        : 0.10;
      const commissionUsd = subtotalUsd * commissionRate;
      const shippingUsd = 0; // TODO: calculate based on shipping method
      const totalUsd = subtotalUsd + shippingUsd;

      // Check buyer wallet balance
      const wallet = await ctx.db.wallet.findUnique({ where: { userId: buyerId } });
      if (!wallet || Number(wallet.balanceUsd) - Number(wallet.lockedUsd) < totalUsd) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient credits" });
      }

      // Create order + lock credits in transaction
      const order = await ctx.db.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            buyerId,
            sellerId: listing.sellerId,
            status: "PAID",
            subtotalUsd,
            shippingUsd,
            commissionUsd,
            totalUsd,
            shippingMethod: input.shippingMethod,
            shippingAddressId: input.shippingAddressId,
          },
        });

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            listingId: listing.id,
            quantity: input.quantity,
            unitPriceUsd: listing.priceUsd,
          },
        });

        // Lock credits (move from available to locked)
        await tx.wallet.update({
          where: { userId: buyerId },
          data: { lockedUsd: { increment: totalUsd } },
        });

        // Record transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet!.id,
            type: "PURCHASE",
            amountUsd: -totalUsd,
            orderId: newOrder.id,
            description: `Purchase: ${listing.title}`,
          },
        });

        // Decrease listing quantity
        const newQuantity = listing.quantity - input.quantity;
        await tx.listing.update({
          where: { id: listing.id },
          data: {
            quantity: newQuantity,
            status: newQuantity === 0 ? "SOLD_OUT" : "ACTIVE",
          },
        });

        return newOrder;
      });

      return order;
    }),

  // Buyer: list my orders
  myOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where: { buyerId: ctx.user.id },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            items: { include: { listing: { include: { wine: { select: { name: true, slug: true, imageUrl: true } } } } } },
            seller: { select: { displayName: true, sellerProfile: { select: { storeName: true } } } },
            shipment: { select: { status: true, trackingCode: true } },
          },
        }),
        ctx.db.order.count({ where: { buyerId: ctx.user.id } }),
      ]);

      return { orders, total, pages: Math.ceil(total / limit), page };
    }),

  // Get order detail
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: {
          id: input.id,
          OR: [{ buyerId: ctx.user.id }, { sellerId: ctx.user.id }],
        },
        include: {
          items: { include: { listing: { include: { wine: true, images: true } } } },
          buyer: { select: { displayName: true, country: true } },
          seller: { select: { displayName: true, country: true, sellerProfile: { select: { storeName: true } } } },
          shippingAddress: true,
          shipment: { include: { events: { orderBy: { createdAt: "desc" } } } },
          review: true,
          dispute: true,
        },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),

  // Seller: list incoming orders
  sellerOrders: sellerProcedure
    .input(
      z.object({
        status: z.enum(["PAID", "AWAITING_SHIPMENT", "SHIPPED", "DELIVERED", "COMPLETED", "DISPUTED"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const where: Record<string, unknown> = { sellerId: ctx.user.id };
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            items: { include: { listing: { include: { wine: { select: { name: true, imageUrl: true } } } } } },
            buyer: { select: { displayName: true, country: true } },
            shippingAddress: true,
          },
        }),
        ctx.db.order.count({ where }),
      ]);

      return { orders, total, pages: Math.ceil(total / limit), page };
    }),

  // Seller: mark order as shipped
  markShipped: sellerProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        carrier: z.string().optional(),
        trackingCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: { id: input.orderId, sellerId: ctx.user.id, status: { in: ["PAID", "AWAITING_SHIPMENT"] } },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.$transaction([
        ctx.db.order.update({
          where: { id: input.orderId },
          data: { status: "SHIPPED" },
        }),
        ctx.db.shipment.upsert({
          where: { orderId: input.orderId },
          update: {
            carrier: input.carrier,
            trackingCode: input.trackingCode,
            status: "IN_TRANSIT",
          },
          create: {
            orderId: input.orderId,
            carrier: input.carrier,
            trackingCode: input.trackingCode,
            status: "IN_TRANSIT",
          },
        }),
      ]);

      return { success: true };
    }),

  // Buyer: confirm delivery → releases credits to seller
  confirmDelivery: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: { id: input.orderId, buyerId: ctx.user.id, status: "SHIPPED" },
        include: { seller: { include: { sellerProfile: true } } },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.$transaction(async (tx) => {
        // Mark order as completed
        await tx.order.update({
          where: { id: input.orderId },
          data: { status: "COMPLETED", deliveredAt: new Date() },
        });

        // Release credits: unlock from buyer, credit to seller (minus commission)
        const sellerWallet = await tx.wallet.upsert({
          where: { userId: order.sellerId },
          update: {},
          create: { userId: order.sellerId },
        });

        const totalUsd = Number(order.totalUsd);
        const commissionUsd = Number(order.commissionUsd);
        const sellerAmount = totalUsd - commissionUsd;

        // Unlock buyer credits and debit
        await tx.wallet.update({
          where: { userId: order.buyerId },
          data: {
            balanceUsd: { decrement: totalUsd },
            lockedUsd: { decrement: totalUsd },
          },
        });

        // Credit seller
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: { balanceUsd: { increment: sellerAmount } },
        });

        // Record transactions
        await tx.walletTransaction.createMany({
          data: [
            {
              walletId: sellerWallet.id,
              type: "SALE_CREDIT",
              amountUsd: sellerAmount,
              orderId: input.orderId,
              description: "Sale proceeds (after commission)",
            },
            {
              walletId: sellerWallet.id,
              type: "COMMISSION",
              amountUsd: -commissionUsd,
              orderId: input.orderId,
              description: `Platform commission (${((commissionUsd / totalUsd) * 100).toFixed(0)}%)`,
            },
          ],
        });

        // Update seller stats
        if (order.seller.sellerProfile) {
          await tx.sellerProfile.update({
            where: { id: order.seller.sellerProfile.id },
            data: { totalSales: { increment: 1 } },
          });
        }

        // Update shipment
        await tx.shipment.updateMany({
          where: { orderId: input.orderId },
          data: { status: "DELIVERED" },
        });
      });

      return { success: true };
    }),
});
