"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");

  const { data: alerts, isLoading } = trpc.alert.list.useQuery();
  const toggleAlert = trpc.alert.toggle.useMutation();
  const deleteAlert = trpc.alert.delete.useMutation();

  const utils = trpc.useUtils();

  function handleToggle(alertId: string, isActive: boolean) {
    toggleAlert.mutate(
      { alertId, isActive },
      { onSuccess: () => utils.alert.list.invalidate() }
    );
  }

  function handleDelete(alertId: string) {
    deleteAlert.mutate(
      { alertId },
      { onSuccess: () => utils.alert.list.invalidate() }
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noAlerts")}</p>
          <p className="text-sm text-muted mb-6">{t("noAlertsDesc")}</p>
          <Link href="/vinhos">
            <Button>{t("browseWines")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const bestPrice = alert.wine.priceSnapshots
              .filter((s) => s.inStock)
              .sort((a, b) => Number(a.priceBrl) - Number(b.priceBrl))[0];

            return (
              <Card key={alert.id} variant={alert.isActive ? "wine" : "default"}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/vinhos/${alert.wine.slug}`}>
                      <h3 className="font-heading text-lg font-semibold hover:text-wine transition-colors truncate">
                        {alert.wine.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                      {bestPrice && (
                        <span>
                          {t("currentPrice")}:{" "}
                          <strong className="text-foreground">
                            {formatBRL(String(bestPrice.priceBrl))}
                          </strong>
                        </span>
                      )}
                      {alert.targetPrice && (
                        <span>
                          {t("targetPrice")}:{" "}
                          <strong className="text-wine">
                            {formatBRL(String(alert.targetPrice))}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={alert.isActive ? "green" : "muted"}>
                      {alert.isActive ? t("active") : t("paused")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(alert.id, !alert.isActive)}
                    >
                      {alert.isActive ? "⏸" : "▶"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(alert.id)}
                    >
                      {tc("delete")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
