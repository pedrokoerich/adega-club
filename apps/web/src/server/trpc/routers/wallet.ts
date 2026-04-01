import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const walletRouter = router({
  // Get wallet balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const wallet = await ctx.db.wallet.upsert({
      where: { userId: ctx.user.id },
      update: {},
      create: { userId: ctx.user.id },
    });

    return {
      balanceUsd: wallet.balanceUsd,
      lockedUsd: wallet.lockedUsd,
      availableUsd: Number(wallet.balanceUsd) - Number(wallet.lockedUsd),
    };
  }),

  // Get transaction history
  transactions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const wallet = await ctx.db.wallet.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!wallet) return { transactions: [], total: 0, pages: 0, page };

      const [transactions, total] = await Promise.all([
        ctx.db.walletTransaction.findMany({
          where: { walletId: wallet.id },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            order: { select: { id: true, status: true } },
          },
        }),
        ctx.db.walletTransaction.count({ where: { walletId: wallet.id } }),
      ]);

      return { transactions, total, pages: Math.ceil(total / limit), page };
    }),

  // Deposit credits (in production, this would integrate with Stripe/Pagar.me)
  deposit: protectedProcedure
    .input(
      z.object({
        amountUsd: z.number().positive().max(10000),
        paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.upsert({
        where: { userId: ctx.user.id },
        update: {},
        create: { userId: ctx.user.id },
      });

      // TODO: Integrate with payment gateway (Stripe/Pagar.me)
      // For now, create a pending transaction
      // In production: create payment intent → webhook confirms → credit wallet

      const transaction = await ctx.db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amountUsd: input.amountUsd,
          description: `Deposit via ${input.paymentMethod}`,
        },
      });

      // In production, credits are only added after payment confirmation via webhook
      // For development, auto-approve:
      if (process.env.NODE_ENV === "development") {
        await ctx.db.wallet.update({
          where: { id: wallet.id },
          data: { balanceUsd: { increment: input.amountUsd } },
        });
      }

      return transaction;
    }),

  // Request withdrawal (seller withdraws credits to local currency)
  withdraw: protectedProcedure
    .input(
      z.object({
        amountUsd: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wallet = await ctx.db.wallet.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!wallet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Wallet not found" });
      }

      const available = Number(wallet.balanceUsd) - Number(wallet.lockedUsd);
      if (input.amountUsd > available) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
      }

      // Create withdrawal transaction + debit wallet
      const [transaction] = await ctx.db.$transaction([
        ctx.db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "WITHDRAWAL",
            amountUsd: -input.amountUsd,
            description: "Withdrawal request",
          },
        }),
        ctx.db.wallet.update({
          where: { id: wallet.id },
          data: { balanceUsd: { decrement: input.amountUsd } },
        }),
      ]);

      return transaction;
    }),
});
