"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  wineId: string;
}

const CONDITION_LABELS: Record<string, string> = {
  SEALED: "Lacrado",
  EXCELLENT: "Excelente",
  GOOD: "Bom",
};

export function MarketplaceListings({ wineId }: Props) {
  const t = useTranslations("listing");

  const { data: listings, isLoading } = trpc.listing.byWine.useQuery({ wineId });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <p className="text-sm text-muted py-4">{t("noListings")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border hover:border-wine/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">
                {listing.seller.sellerProfile?.storeName ?? listing.seller.displayName}
              </span>
              {listing.seller.sellerProfile?.verificationStatus === "VERIFIED" && (
                <Badge variant="green" className="text-[10px] px-1.5 py-0">
                  {t("verified")}
                </Badge>
              )}
              <span className="text-xs text-muted">
                {listing.seller.country}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>{CONDITION_LABELS[listing.condition] ?? listing.condition}</span>
              {listing.shipsFrom && <span>Envia de: {listing.shipsFrom}</span>}
              <span>Qtd: {listing.quantity}</span>
            </div>
            {listing.seller.sellerProfile?.rating && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="text-xs">{listing.seller.sellerProfile.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-wine">
              $ {Number(listing.priceUsd).toFixed(2)}
            </p>
            <p className="text-xs text-muted">{t("perBottle")}</p>
            <Link href={`/checkout?listing=${listing.id}`}>
              <Button size="sm" className="mt-2">
                {t("buyNow")}
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
