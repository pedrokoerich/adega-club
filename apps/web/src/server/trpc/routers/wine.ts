import { z } from "zod";
import { router, publicProcedure } from "../init";

export const wineRouter = router({
  list: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        type: z.string().optional(),
        country: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, type, country, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { producer: { contains: query, mode: "insensitive" } },
          { region: { contains: query, mode: "insensitive" } },
        ];
      }
      if (type) where.type = type;
      if (country) where.country = country;

      const [wines, total] = await Promise.all([
        ctx.db.wine.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: "asc" },
          include: {
            priceSnapshots: {
              orderBy: { scrapedAt: "desc" },
              distinct: ["store"],
              take: 10,
            },
          },
        }),
        ctx.db.wine.count({ where }),
      ]);

      const winesWithBestPrice = wines.map((wine) => {
        const inStockPrices = wine.priceSnapshots.filter((s) => s.inStock);
        const bestPrice =
          inStockPrices.length > 0
            ? inStockPrices.reduce((min, s) =>
                s.priceBrl < min.priceBrl ? s : min
              )
            : null;

        return {
          ...wine,
          bestPrice: bestPrice
            ? { price: bestPrice.priceBrl, store: bestPrice.store }
            : null,
          storeCount: wine.priceSnapshots.length,
        };
      });

      return {
        wines: winesWithBestPrice,
        total,
        pages: Math.ceil(total / limit),
        page,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const wine = await ctx.db.wine.findUnique({
        where: { slug: input.slug },
        include: {
          priceSnapshots: {
            orderBy: { scrapedAt: "desc" },
            take: 200,
          },
        },
      });

      if (!wine) return null;

      const latestByStore = new Map<
        string,
        (typeof wine.priceSnapshots)[0]
      >();
      for (const snap of wine.priceSnapshots) {
        if (!latestByStore.has(snap.store)) {
          latestByStore.set(snap.store, snap);
        }
      }

      return {
        ...wine,
        latestPrices: Array.from(latestByStore.values()).sort((a, b) =>
          Number(a.priceBrl) - Number(b.priceBrl)
        ),
        priceHistory: wine.priceSnapshots,
      };
    }),

  search: publicProcedure
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.wine.findMany({
        where: {
          OR: [
            { name: { contains: input.q, mode: "insensitive" } },
            { producer: { contains: input.q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, slug: true, producer: true, type: true },
        take: 10,
      });
    }),
});
