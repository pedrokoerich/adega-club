import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

interface WineCardProps {
  wine: {
    slug: string;
    name: string;
    producer: string | null;
    country: string | null;
    region: string | null;
    type: string;
    grapes: string[];
    vintage: number | null;
    avgRating: number | null;
    bestPrice: { price: string | number; store: string } | null;
    storeCount: number;
  };
}

export function WineCard({ wine }: WineCardProps) {
  const t = useTranslations();

  return (
    <Link href={`/vinhos/${wine.slug}`}>
      <div className="group rounded-lg border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:border-wine/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-wine transition-colors truncate">
              {wine.name}
            </h3>
            {wine.producer && (
              <p className="text-sm text-muted mt-0.5">{wine.producer}</p>
            )}
          </div>
          {wine.avgRating && (
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <span className="text-gold text-sm">★</span>
              <span className="text-sm font-medium">{wine.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="wine">{t(`wineTypes.${wine.type}`)}</Badge>
          {wine.country && <Badge variant="muted">{wine.country}</Badge>}
          {wine.vintage && <Badge variant="muted">{wine.vintage}</Badge>}
        </div>

        {wine.grapes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {wine.grapes.slice(0, 3).map((grape) => (
              <span
                key={grape}
                className="text-xs text-muted bg-surface-2 rounded px-2 py-0.5"
              >
                {grape}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between pt-3 border-t border-border">
          {wine.bestPrice ? (
            <div>
              <span className="label-mono">{t("wines.bestPrice")}</span>
              <p className="text-xl font-heading font-bold text-wine">
                {formatBRL(wine.bestPrice.price)}
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted">{t("wines.outOfStock")}</span>
          )}
          <span className="text-xs text-muted">
            {wine.storeCount} {t("wines.stores")}
          </span>
        </div>
      </div>
    </Link>
  );
}
