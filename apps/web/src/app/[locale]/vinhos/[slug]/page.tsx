import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerTRPC } from "@/lib/trpc/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriceTable } from "@/components/wine/price-table";
import { PriceChart } from "@/components/wine/price-chart";
import { AlertButton } from "@/components/wine/alert-button";
import { MarketplaceListings } from "@/components/wine/marketplace-listings";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trpc = await getServerTRPC();
  const wine = await trpc.wine.getBySlug({ slug });

  if (!wine) return { title: "Vinho não encontrado" };

  return {
    title: `${wine.name}${wine.vintage ? ` ${wine.vintage}` : ""} - Comparar Preços`,
    description: `Compare preços de ${wine.name} de ${wine.producer ?? "produtor"} nas melhores lojas do Brasil.`,
  };
}

export default async function WineDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations();
  const trpc = await getServerTRPC();
  const wine = await trpc.wine.getBySlug({ slug });

  if (!wine) notFound();

  const priceHistory = await trpc.price.history({ wineId: wine.id });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wine Info - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wine Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="wine">{t(`wineTypes.${wine.type}`)}</Badge>
              {wine.country && <Badge variant="muted">{wine.country}</Badge>}
              {wine.vintage && <Badge variant="gold">{wine.vintage}</Badge>}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {wine.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              {wine.producer && (
                <span>
                  <strong className="text-foreground">
                    {t("wineDetail.producer")}:
                  </strong>{" "}
                  {wine.producer}
                </span>
              )}
              {wine.region && (
                <span>
                  <strong className="text-foreground">
                    {t("wineDetail.region")}:
                  </strong>{" "}
                  {wine.region}
                </span>
              )}
              {wine.avgRating && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gold fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <strong>{wine.avgRating.toFixed(1)}</strong>
                </span>
              )}
            </div>

            {wine.grapes.length > 0 && (
              <div className="mt-4">
                <span className="label-mono block mb-2">
                  {t("wineDetail.grapes")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wine.grapes.map((grape) => (
                    <Badge key={grape} variant="muted">
                      {grape}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Comparison Table */}
          <Card>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              {t("wineDetail.priceComparison")}
            </h2>
            <PriceTable
              prices={wine.latestPrices.map((p) => ({
                store: p.store,
                priceBrl: String(p.priceBrl),
                url: p.url,
                inStock: p.inStock,
                scrapedAt: p.scrapedAt.toISOString(),
              }))}
            />
          </Card>

          {/* Price History Chart */}
          <Card>
            <PriceChart data={priceHistory} />
          </Card>

          {/* Marketplace Listings */}
          <Card>
            <h2 className="font-heading text-2xl font-semibold mb-4">
              {t("listing.marketplaceListings")}
            </h2>
            <MarketplaceListings wineId={wine.id} />
          </Card>
        </div>

        {/* Right Column - Alert + Info */}
        <div className="space-y-6">
          <Card variant="wine">
            <h3 className="font-heading text-xl font-semibold mb-4">
              {t("wineDetail.alertButton")}
            </h3>
            <AlertButton wineId={wine.id} />
          </Card>

          {/* Quick Stats */}
          <Card>
            <div className="space-y-3">
              {wine.latestPrices.length > 0 && (
                <div>
                  <span className="label-mono">
                    {t("wines.bestPrice")}
                  </span>
                  <p className="text-2xl font-heading font-bold text-green">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(wine.latestPrices[0].priceBrl))}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {wine.latestPrices[0].store}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-border">
                <span className="label-mono">
                  {t("wines.stores")}
                </span>
                <p className="text-lg font-semibold">
                  {wine.latestPrices.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
