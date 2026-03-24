import { router, createCallerFactory } from "./init";
import { wineRouter } from "./routers/wine";
import { priceRouter } from "./routers/price";
import { alertRouter } from "./routers/alert";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  wine: wineRouter,
  price: priceRouter,
  alert: alertRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
