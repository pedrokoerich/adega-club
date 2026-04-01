import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/server/db";
import { getUser, isAdmin, ensureUserProfile } from "@/server/auth";
import type { UserProfile, SellerProfile, Wallet } from "@/generated/prisma/client";

export type UserWithProfile = {
  id: string;
  email: string;
  profile: UserProfile & {
    sellerProfile: SellerProfile | null;
    wallet: Wallet | null;
  };
};

export const createTRPCContext = async () => {
  const user = await getUser();
  return { db, user };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Ensure UserProfile exists (auto-create on first access)
  const profile = await ensureUserProfile(ctx.user.id, ctx.user.email!);
  const fullProfile = await ctx.db.userProfile.findUnique({
    where: { id: ctx.user.id },
    include: { sellerProfile: true, wallet: true },
  });

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      profile: fullProfile ?? profile,
    },
  });
});

export const sellerProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const profile = await ctx.db.userProfile.findUnique({
    where: { id: ctx.user.id },
    include: { sellerProfile: true, wallet: true },
  });

  if (!profile || (profile.role !== "SELLER" && profile.role !== "ADMIN")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seller account required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      profile,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const admin = await isAdmin(ctx.user.email);
  if (!admin) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
