import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUser } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountUsd } = await req.json();
    if (!amountUsd || amountUsd < 5 || amountUsd > 10000) {
      return NextResponse.json(
        { error: "Amount must be between $5 and $10,000 USD" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Adega Club Credits",
              description: `Deposit of $${amountUsd.toFixed(2)} USD credits`,
            },
            unit_amount: Math.round(amountUsd * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        amountUsd: String(amountUsd),
        type: "wallet_deposit",
      },
      success_url: `${appUrl}/carteira?deposit=success`,
      cancel_url: `${appUrl}/carteira?deposit=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
