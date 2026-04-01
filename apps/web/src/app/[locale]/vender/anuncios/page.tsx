"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyListingsPage() {
  const t = useTranslations("seller");
  const { data, isLoading } = trpc.listing.myListings.useQuery({ page: 1, limit: 20 });
  const utils = trpc.useUtils();

  const updateListing = trpc.listing.update.useMutation({
    onSuccess: () => utils.listing.myListings.invalidate(),
  });
  const removeListing = trpc.listing.remove.useMutation({
    onSuccess: () => utils.listing.myListings.invalidate(),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("myListings")}</h1>
          <p className="text-muted">{data ? `${data.total} anúncios` : ""}</p>
        </div>
        <Link href="/vender/anuncios/novo">
          <Button>{t("newListing")}</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !data?.listings.length ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noListings")}</p>
          <p className="text-sm text-muted mb-6">{t("noListingsDesc")}</p>
          <Link href="/vender/anuncios/novo">
            <Button>{t("newListing")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.listings.map((listing) => (
            <Card key={listing.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-semibold truncate">
                    {listing.wine.name}
                  </h3>
                  <p className="text-sm text-muted truncate">{listing.wine.type}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="font-semibold text-wine">
                      $ {Number(listing.priceUsd).toFixed(2)}
                    </span>
                    <span className="text-muted">
                      Qtd: {listing.quantity}
                    </span>
                    <span className="text-muted">
                      Vendas: {listing._count.orderItems}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={listing.status === "ACTIVE" ? "green" : "muted"}>
                    {listing.status}
                  </Badge>
                  {listing.status === "ACTIVE" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateListing.mutate({ id: listing.id, status: "PAUSED" })}
                    >
                      Pausar
                    </Button>
                  ) : listing.status === "PAUSED" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateListing.mutate({ id: listing.id, status: "ACTIVE" })}
                    >
                      Ativar
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeListing.mutate({ id: listing.id })}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
