import { z } from "zod";
import { router, protectedProcedure } from "../init";

export const alertRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        wineId: z.string().uuid(),
        targetPrice: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.priceAlert.upsert({
        where: {
          userId_wineId: {
            userId: ctx.user.id,
            wineId: input.wineId,
          },
        },
        update: {
          targetPrice: input.targetPrice ?? null,
          isActive: true,
        },
        create: {
          userId: ctx.user.id,
          wineId: input.wineId,
          targetPrice: input.targetPrice ?? null,
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.priceAlert.findMany({
      where: { userId: ctx.user.id },
      include: {
        wine: {
          include: {
            priceSnapshots: {
              orderBy: { scrapedAt: "desc" },
              distinct: ["store"],
              take: 5,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ alertId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.priceAlert.deleteMany({
        where: { id: input.alertId, userId: ctx.user.id },
      });
    }),

  toggle: protectedProcedure
    .input(
      z.object({
        alertId: z.string().uuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.priceAlert.updateMany({
        where: { id: input.alertId, userId: ctx.user.id },
        data: { isActive: input.isActive },
      });
    }),
});
