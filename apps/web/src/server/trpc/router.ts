import { router, createCallerFactory } from "./init";
import { wineRouter } from "./routers/wine";
import { priceRouter } from "./routers/price";
import { alertRouter } from "./routers/alert";
import { adminRouter } from "./routers/admin";
import { sellerRouter } from "./routers/seller";
import { listingRouter } from "./routers/listing";
import { walletRouter } from "./routers/wallet";
import { orderRouter } from "./routers/order";

export const appRouter = router({
  wine: wineRouter,
  price: priceRouter,
  alert: alertRouter,
  admin: adminRouter,
  seller: sellerRouter,
  listing: listingRouter,
  wallet: walletRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
