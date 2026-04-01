import { z } from "zod";
import { router, protectedProcedure, sellerProcedure } from "../init";
import { TRPCError } from "@trpc/server";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const sellerRouter = router({
  // Register as seller
  register: protectedProcedure
    .input(
      z.object({
        storeName: z.string().min(3).max(50),
        description: z.string().max(500).optional(),
        sellerType: z.enum(["INDIVIDUAL", "BUSINESS"]),
        documentType: z.enum(["CPF", "CNPJ", "DNI", "RUT", "CI", "PASSPORT"]),
        documentNumber: z.string().min(5).max(20),
        country: z.string().length(2),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if already a seller
      const existing = await ctx.db.sellerProfile.findUnique({
        where: { userId },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already registered as seller" });
      }

      const storeSlug = slugify(input.storeName);

      // Check slug uniqueness
      const slugExists = await ctx.db.sellerProfile.findUnique({
        where: { storeSlug },
      });
      if (slugExists) {
        throw new TRPCError({ code: "CONFLICT", message: "Store name already taken" });
      }

      // Create seller profile + update user in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        await tx.userProfile.update({
          where: { id: userId },
          data: {
            role: "SELLER",
            documentType: input.documentType,
            documentNumber: input.documentNumber,
            country: input.country,
            phone: input.phone,
          },
        });

        const sellerProfile = await tx.sellerProfile.create({
          data: {
            userId,
            storeName: input.storeName,
            storeSlug,
            description: input.description,
            sellerType: input.sellerType,
          },
        });

        // Ensure wallet exists
        await tx.wallet.upsert({
          where: { userId },
          update: {},
          create: { userId },
        });

        return sellerProfile;
      });

      return result;
    }),

  // Get own seller profile
  getProfile: sellerProcedure.query(async ({ ctx }) => {
    return ctx.db.sellerProfile.findUnique({
      where: { userId: ctx.user.id },
      include: { user: { select: { displayName: true, email: true, country: true, avatarUrl: true } } },
    });
  }),

  // Update seller profile
  updateProfile: sellerProcedure
    .input(
      z.object({
        storeName: z.string().min(3).max(50).optional(),
        description: z.string().max(500).optional(),
        logoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.sellerProfile.update({
        where: { userId: ctx.user.id },
        data: input,
      });
    }),

  // Get public seller store page
  getStore: router({
    bySlug: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ ctx, input }) => {
        return ctx.db.sellerProfile.findUnique({
          where: { storeSlug: input.slug },
          include: {
            user: { select: { displayName: true, country: true, avatarUrl: true, createdAt: true } },
          },
        });
      }),
  }),

  // Get seller stats
  stats: sellerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [activeListings, totalOrders, pendingOrders] = await Promise.all([
      ctx.db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
      ctx.db.order.count({ where: { sellerId: userId } }),
      ctx.db.order.count({ where: { sellerId: userId, status: { in: ["PAID", "AWAITING_SHIPMENT"] } } }),
    ]);

    return { activeListings, totalOrders, pendingOrders };
  }),
});
