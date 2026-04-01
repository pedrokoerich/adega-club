import { z } from "zod";
import { router, publicProcedure, sellerProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const listingRouter = router({
  // Public: browse marketplace listings
  list: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        wineType: z.string().optional(),
        country: z.string().optional(),
        condition: z.enum(["SEALED", "EXCELLENT", "GOOD"]).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, wineType, country, condition, minPrice, maxPrice, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { status: "ACTIVE" };

      if (query) {
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { wine: { name: { contains: query, mode: "insensitive" } } },
          { wine: { producer: { contains: query, mode: "insensitive" } } },
        ];
      }
      if (condition) where.condition = condition;
      if (minPrice || maxPrice) {
        where.priceUsd = {};
        if (minPrice) (where.priceUsd as Record<string, unknown>).gte = minPrice;
        if (maxPrice) (where.priceUsd as Record<string, unknown>).lte = maxPrice;
      }
      if (wineType || country) {
        where.wine = {};
        if (wineType) (where.wine as Record<string, unknown>).type = wineType;
        if (country) (where.wine as Record<string, unknown>).country = country;
      }

      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            wine: { select: { id: true, name: true, slug: true, type: true, producer: true, imageUrl: true, grapes: true, vintage: true } },
            seller: { select: { displayName: true, country: true, sellerProfile: { select: { storeName: true, storeSlug: true, rating: true, verificationStatus: true } } } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        }),
        ctx.db.listing.count({ where }),
      ]);

      return { listings, total, pages: Math.ceil(total / limit), page };
    }),

  // Public: get listing by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.id },
        include: {
          wine: true,
          seller: {
            select: {
              id: true, displayName: true, country: true, avatarUrl: true, createdAt: true,
              sellerProfile: { select: { storeName: true, storeSlug: true, rating: true, totalSales: true, verificationStatus: true } },
            },
          },
          images: { orderBy: { order: "asc" } },
        },
      });

      if (!listing || listing.status === "REMOVED") return null;
      return listing;
    }),

  // Public: get marketplace listings for a specific wine
  byWine: publicProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.listing.findMany({
        where: { wineId: input.wineId, status: "ACTIVE" },
        orderBy: { priceUsd: "asc" },
        include: {
          seller: {
            select: {
              displayName: true, country: true,
              sellerProfile: { select: { storeName: true, storeSlug: true, rating: true, verificationStatus: true } },
            },
          },
          images: { where: { isPrimary: true }, take: 1 },
        },
      });
    }),

  // Seller: create listing
  create: sellerProcedure
    .input(
      z.object({
        wineId: z.string().uuid(),
        title: z.string().min(5).max(200),
        description: z.string().max(2000).optional(),
        priceUsd: z.number().positive(),
        quantity: z.number().int().min(1),
        condition: z.enum(["SEALED", "EXCELLENT", "GOOD"]),
        shipsFrom: z.string().optional(),
        imageUrls: z.array(z.string().url()).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { imageUrls, ...listingData } = input;

      const listing = await ctx.db.listing.create({
        data: {
          ...listingData,
          sellerId: ctx.user.id,
        },
      });

      if (imageUrls?.length) {
        await ctx.db.listingImage.createMany({
          data: imageUrls.map((url, i) => ({
            listingId: listing.id,
            url,
            order: i,
            isPrimary: i === 0,
          })),
        });
      }

      return listing;
    }),

  // Seller: update listing
  update: sellerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(5).max(200).optional(),
        description: z.string().max(2000).optional(),
        priceUsd: z.number().positive().optional(),
        quantity: z.number().int().min(0).optional(),
        condition: z.enum(["SEALED", "EXCELLENT", "GOOD"]).optional(),
        status: z.enum(["ACTIVE", "PAUSED"]).optional(),
        shipsFrom: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const listing = await ctx.db.listing.findFirst({
        where: { id, sellerId: ctx.user.id },
      });
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.listing.update({ where: { id }, data });
    }),

  // Seller: list own listings
  myListings: sellerProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "PAUSED", "SOLD_OUT", "REMOVED"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = { sellerId: ctx.user.id };
      if (status) where.status = status;

      const [listings, total] = await Promise.all([
        ctx.db.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            wine: { select: { name: true, slug: true, type: true, imageUrl: true } },
            images: { where: { isPrimary: true }, take: 1 },
            _count: { select: { orderItems: true } },
          },
        }),
        ctx.db.listing.count({ where }),
      ]);

      return { listings, total, pages: Math.ceil(total / limit), page };
    }),

  // Seller: delete listing
  remove: sellerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findFirst({
        where: { id: input.id, sellerId: ctx.user.id },
      });
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.db.listing.update({
        where: { id: input.id },
        data: { status: "REMOVED" },
      });
    }),
});
