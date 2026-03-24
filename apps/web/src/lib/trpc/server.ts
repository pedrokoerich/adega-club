import "server-only";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/router";

export async function getServerTRPC() {
  const context = await createTRPCContext();
  return createCaller(context);
}
