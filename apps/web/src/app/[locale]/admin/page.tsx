"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const t = useTranslations("adminPanel");

  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const statCards = [
    { label: t("totalWines"), value: stats?.totalWines ?? 0, color: "wine" as const },
    { label: t("totalSnapshots"), value: stats?.totalSnapshots ?? 0, color: "gold" as const },
    { label: t("activeAlerts"), value: stats?.activeAlerts ?? 0, color: "default" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
        <Link href="/admin/vinhos">
          <Button>{t("manageWines")}</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label} variant={stat.color}>
              <span className="label-mono">{stat.label}</span>
              <p className="text-3xl font-heading font-bold mt-2">
                {stat.value.toLocaleString("pt-BR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
