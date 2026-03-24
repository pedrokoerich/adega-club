import { z } from "zod";
import { router, adminProcedure } from "../init";
import { slugify } from "@/lib/utils";

export const adminRouter = router({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalWines, totalSnapshots, activeAlerts] = await Promise.all([
      ctx.db.wine.count(),
      ctx.db.priceSnapshot.count(),
      ctx.db.priceAlert.count({ where: { isActive: true } }),
    ]);

    return { totalWines, totalSnapshots, activeAlerts };
  }),

  createWine: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        producer: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        grapes: z.array(z.string()).default([]),
        vintage: z.number().optional(),
        type: z
          .enum(["TINTO", "BRANCO", "ROSE", "ESPUMANTE", "SOBREMESA"])
          .default("TINTO"),
        avgRating: z.number().min(0).max(5).optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(
        `${input.name}${input.vintage ? `-${input.vintage}` : ""}`
      );

      return ctx.db.wine.create({
        data: {
          ...input,
          slug,
        },
      });
    }),

  updateWine: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        producer: z.string().optional(),
        country: z.string().optional(),
        region: z.string().optional(),
        grapes: z.array(z.string()).optional(),
        vintage: z.number().optional(),
        type: z
          .enum(["TINTO", "BRANCO", "ROSE", "ESPUMANTE", "SOBREMESA"])
          .optional(),
        avgRating: z.number().min(0).max(5).optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.wine.update({ where: { id }, data });
    }),

  deleteWine: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.wine.delete({ where: { id: input.id } });
    }),

  listWines: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const [wines, total] = await Promise.all([
        ctx.db.wine.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { name: "asc" },
          include: {
            _count: { select: { priceSnapshots: true, priceAlerts: true } },
          },
        }),
        ctx.db.wine.count(),
      ]);

      return { wines, total, pages: Math.ceil(total / input.limit) };
    }),
});
