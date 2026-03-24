import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendPriceAlert } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all active alerts with wine data
  const alerts = await db.priceAlert.findMany({
    where: { isActive: true },
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
  });

  let sent = 0;

  for (const alert of alerts) {
    // Skip if notified in last 24h
    if (
      alert.lastNotified &&
      Date.now() - alert.lastNotified.getTime() < 24 * 60 * 60 * 1000
    ) {
      continue;
    }

    const inStockPrices = alert.wine.priceSnapshots.filter((s) => s.inStock);
    if (inStockPrices.length === 0) continue;

    const bestPrice = inStockPrices.reduce((min, s) =>
      Number(s.priceBrl) < Number(min.priceBrl) ? s : min
    );

    // Check if price meets target
    if (alert.targetPrice && Number(bestPrice.priceBrl) > Number(alert.targetPrice)) {
      continue;
    }

    // Get user email from Supabase Auth
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
      alert.userId
    );
    if (!userData?.user?.email) continue;

    try {
      await sendPriceAlert({
        to: userData.user.email,
        wineName: alert.wine.name,
        oldPrice: alert.targetPrice ? Number(alert.targetPrice) : Number(bestPrice.priceBrl) * 1.1,
        newPrice: Number(bestPrice.priceBrl),
        store: bestPrice.store,
        slug: alert.wine.slug,
      });

      await db.priceAlert.update({
        where: { id: alert.id },
        data: { lastNotified: new Date() },
      });

      sent++;
    } catch (error) {
      console.error(`Failed to send alert ${alert.id}:`, error);
    }
  }

  return NextResponse.json({ ok: true, alertsProcessed: alerts.length, emailsSent: sent });
}
