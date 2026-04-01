import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/server/db";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, amountUsd, type } = session.metadata || {};

    if (type === "wallet_deposit" && userId && amountUsd) {
      const amount = parseFloat(amountUsd);

      try {
        await db.$transaction(async (tx) => {
          // Ensure wallet exists
          const wallet = await tx.wallet.upsert({
            where: { userId },
            update: {},
            create: { userId },
          });

          // Credit the wallet
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balanceUsd: { increment: amount } },
          });

          // Record the transaction
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: "DEPOSIT",
              amountUsd: amount,
              description: `Stripe deposit`,
              externalRef: session.payment_intent as string,
            },
          });
        });

        console.log(`Wallet deposit: $${amount} for user ${userId}`);
      } catch (error) {
        console.error("Failed to process deposit:", error);
        return NextResponse.json(
          { error: "Failed to process deposit" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
