import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const freighterRouter = router({
  // Register as freighter
  register: protectedProcedure
    .input(
      z.object({
        vehicleType: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.freighterProfile.findUnique({
        where: { userId: ctx.user.id },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already registered as freighter" });
      }

      return ctx.db.freighterProfile.create({
        data: {
          userId: ctx.user.id,
          vehicleType: input.vehicleType,
          description: input.description,
        },
      });
    }),

  // Get my freighter profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.freighterProfile.findUnique({
      where: { userId: ctx.user.id },
      include: {
        routes: { orderBy: { createdAt: "desc" } },
        _count: { select: { shipments: true } },
      },
    });
  }),

  // Create a route
  createRoute: protectedProcedure
    .input(
      z.object({
        originCity: z.string().min(1),
        originCountry: z.string().length(2),
        destCity: z.string().min(1),
        destCountry: z.string().length(2),
        departureDate: z.string().datetime().optional(),
        frequency: z.string().optional(),
        maxBottles: z.number().int().min(1).optional(),
        pricePerBottleUsd: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.freighterProfile.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Register as freighter first" });
      }

      return ctx.db.freightRoute.create({
        data: {
          freighterId: profile.id,
          originCity: input.originCity,
          originCountry: input.originCountry,
          destCity: input.destCity,
          destCountry: input.destCountry,
          departureDate: input.departureDate ? new Date(input.departureDate) : null,
          frequency: input.frequency,
          maxBottles: input.maxBottles,
          pricePerBottleUsd: input.pricePerBottleUsd,
        },
      });
    }),

  // Update route
  updateRoute: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isActive: z.boolean().optional(),
        maxBottles: z.number().int().min(1).optional(),
        pricePerBottleUsd: z.number().min(0).optional(),
        departureDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const route = await ctx.db.freightRoute.findFirst({
        where: { id: input.id, freighter: { userId: ctx.user.id } },
      });
      if (!route) throw new TRPCError({ code: "NOT_FOUND" });

      const { id, ...data } = input;
      return ctx.db.freightRoute.update({
        where: { id },
        data: {
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.maxBottles !== undefined ? { maxBottles: data.maxBottles } : {}),
          ...(data.pricePerBottleUsd !== undefined ? { pricePerBottleUsd: data.pricePerBottleUsd } : {}),
          ...(data.departureDate ? { departureDate: new Date(data.departureDate) } : {}),
        },
      });
    }),

  // Delete route
  removeRoute: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const route = await ctx.db.freightRoute.findFirst({
        where: { id: input.id, freighter: { userId: ctx.user.id } },
      });
      if (!route) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.freightRoute.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // Public: search available routes
  searchRoutes: publicProcedure
    .input(
      z.object({
        originCountry: z.string().length(2).optional(),
        destCountry: z.string().length(2).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { originCountry, destCountry, page, limit } = input;
      const where: Record<string, unknown> = { isActive: true };
      if (originCountry) where.originCountry = originCountry;
      if (destCountry) where.destCountry = destCountry;

      const [routes, total] = await Promise.all([
        ctx.db.freightRoute.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            freighter: {
              select: {
                id: true,
                rating: true,
                totalDeliveries: true,
                verificationStatus: true,
              },
            },
          },
        }),
        ctx.db.freightRoute.count({ where }),
      ]);

      return { routes, total, pages: Math.ceil(total / limit), page };
    }),

  // My routes
  myRoutes: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.freighterProfile.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!profile) return [];

    return ctx.db.freightRoute.findMany({
      where: { freighterId: profile.id },
      orderBy: { createdAt: "desc" },
    });
  }),
});
