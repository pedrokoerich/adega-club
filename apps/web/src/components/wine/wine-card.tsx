import Image from "next/image";
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
    imageUrl?: string | null;
    bestPrice: { price: string | number; store: string } | null;
    storeCount: number;
  };
}

const typeGradients: Record<string, string> = {
  TINTO: "from-[#3d1225] to-[#5a1029]",
  BRANCO: "from-[#b8943f]/30 to-[#f0ebe3]",
  ROSE: "from-[#a8294f]/25 to-[#f0ebe3]",
  ESPUMANTE: "from-[#1d4e89]/20 to-[#f0ebe3]",
  SOBREMESA: "from-[#b8943f]/40 to-[#3d1225]",
};

export function WineCard({ wine }: WineCardProps) {
  const t = useTranslations();
  const gradient = typeGradients[wine.type] ?? typeGradients.TINTO;
  const isLight = ["BRANCO", "ROSE", "ESPUMANTE"].includes(wine.type);

  return (
    <Link href={`/vinhos/${wine.slug}`}>
      <div className="group rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-lg hover:border-wine/20 transition-all duration-300">
        {/* Wine type gradient header with image placeholder */}
        <div className={`relative h-36 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between`}>
          {wine.imageUrl ? (
            <Image
              src={wine.imageUrl}
              alt={wine.name}
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className={`w-16 h-16 ${isLight ? "text-muted/15" : "text-white/10"}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.5 2 7.5 4.5 7 7c-.5 2.5 0 4.5 1.5 6.2V19H9v1H8v2h8v-2h-1v-1h-.5v-5.8C16 12.5 16.5 10.5 16 8c-.5-3-2.5-6-4-6z"/>
              </svg>
            </div>
          )}
          <div className="relative z-10 flex items-start justify-between">
            <Badge
              variant={isLight ? "muted" : "wine"}
              className={!isLight ? "!bg-white/15 !text-white" : ""}
            >
              {t(`wineTypes.${wine.type}`)}
            </Badge>
            {wine.avgRating && (
              <div className={`flex items-center gap-1 ${isLight ? "text-gold" : "text-gold"}`}>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className={`text-xs font-medium ${isLight ? "text-foreground" : "text-white/80"}`}>
                  {wine.avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="relative z-10">
            {wine.country && (
              <p className={`font-mono text-[10px] uppercase tracking-widest ${isLight ? "text-muted" : "text-white/50"}`}>
                {wine.country}{wine.region ? ` \u00B7 ${wine.region}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Wine info */}
        <div className="p-5">
          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-wine transition-colors line-clamp-2 leading-snug mb-1">
            {wine.name}
          </h3>
          {wine.producer && (
            <p className="text-sm text-muted truncate">{wine.producer}</p>
          )}

          {wine.grapes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {wine.grapes.slice(0, 2).map((grape) => (
                <span
                  key={grape}
                  className="text-[11px] text-muted bg-surface-2 rounded-full px-2.5 py-0.5"
                >
                  {grape}
                </span>
              ))}
              {wine.vintage && (
                <span className="text-[11px] text-muted bg-surface-2 rounded-full px-2.5 py-0.5">
                  {wine.vintage}
                </span>
              )}
            </div>
          )}

          <div className="flex items-end justify-between pt-4 mt-4 border-t border-border/60">
            {wine.bestPrice ? (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-0.5">
                  {t("wines.bestPrice")}
                </span>
                <p className="text-xl font-heading font-bold text-wine">
                  {formatBRL(wine.bestPrice.price)}
                </p>
              </div>
            ) : (
              <span className="text-sm text-muted">{t("wines.outOfStock")}</span>
            )}
            <span className="text-[11px] text-muted font-mono">
              {wine.storeCount} {t("wines.stores")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
