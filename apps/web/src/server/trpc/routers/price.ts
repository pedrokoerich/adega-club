import { z } from "zod";
import { router, publicProcedure } from "../init";

export const priceRouter = router({
  latest: publicProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const snapshots = await ctx.db.priceSnapshot.findMany({
        where: { wineId: input.wineId },
        orderBy: { scrapedAt: "desc" },
        distinct: ["store"],
      });

      return snapshots.sort((a, b) => Number(a.priceBrl) - Number(b.priceBrl));
    }),

  history: publicProcedure
    .input(
      z.object({
        wineId: z.string().uuid(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const snapshots = await ctx.db.priceSnapshot.findMany({
        where: {
          wineId: input.wineId,
          scrapedAt: { gte: since },
        },
        orderBy: { scrapedAt: "asc" },
        select: {
          store: true,
          priceBrl: true,
          scrapedAt: true,
        },
      });

      const byStore: Record<
        string,
        { date: string; price: number }[]
      > = {};

      for (const snap of snapshots) {
        if (!byStore[snap.store]) byStore[snap.store] = [];
        byStore[snap.store].push({
          date: snap.scrapedAt.toISOString().split("T")[0],
          price: Number(snap.priceBrl),
        });
      }

      return byStore;
    }),
});
