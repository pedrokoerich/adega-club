"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "muted",
  PAID: "wine",
  AWAITING_SHIPMENT: "wine",
  SHIPPED: "wine",
  DELIVERED: "green",
  COMPLETED: "green",
  CANCELLED: "muted",
  DISPUTED: "wine",
  REFUNDED: "muted",
};

export default function OrdersPage() {
  const t = useTranslations("order");
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading } = trpc.order.myOrders.useQuery(
    { page: 1, limit: 20 },
    { enabled: !!user }
  );

  const utils = trpc.useUtils();
  const confirmDelivery = trpc.order.confirmDelivery.useMutation({
    onSuccess: () => utils.order.myOrders.invalidate(),
  });

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("myOrders")}</h1>
        <Link href="/auth/login"><Button>Entrar para continuar</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">{t("myOrders")}</h1>

      {!data?.orders.length ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noOrders")}</p>
          <p className="text-sm text-muted mb-6">{t("noOrdersDesc")}</p>
          <Link href="/vinhos">
            <Button>Explorar vinhos</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={(STATUS_COLORS[order.status] ?? "muted") as "wine" | "green" | "muted"}>
                      {t(`statuses.${order.status}`)}
                    </Badge>
                    <span className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.listing.wine.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.listing.wine.imageUrl}
                          alt={item.listing.wine.name}
                          className="w-10 h-14 object-contain"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{item.listing.wine.name}</p>
                        <p className="text-sm text-muted">
                          {item.quantity}x $ {Number(item.unitPriceUsd).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 text-sm text-muted">
                    {t("seller")}: {order.seller.sellerProfile?.storeName ?? order.seller.displayName}
                  </div>

                  {order.shipment?.trackingCode && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted">{t("trackingCode")}:</span>{" "}
                      <span className="font-mono">{order.shipment.trackingCode}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="text-xl font-bold">$ {Number(order.totalUsd).toFixed(2)}</p>

                  {order.status === "SHIPPED" && (
                    <Button
                      size="sm"
                      onClick={() => confirmDelivery.mutate({ orderId: order.id })}
                      disabled={confirmDelivery.isPending}
                    >
                      {t("confirmDelivery")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
