import { getTranslations } from "next-intl/server";
import { getServerTRPC } from "@/lib/trpc/server";
import { WineSearch } from "@/components/wine/wine-search";
import { WineCard } from "@/components/wine/wine-card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    country?: string;
    page?: string;
  }>;
}

export default async function WinesPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations();
  const trpc = await getServerTRPC();

  const page = parseInt(params.page ?? "1", 10);
  const result = await trpc.wine.list({
    query: params.q,
    type: params.type,
    country: params.country,
    page,
  });

  const types = ["TINTO", "BRANCO", "ROSE", "ESPUMANTE", "SOBREMESA"];
  const countries = ["Argentina", "Chile", "Uruguay", "Brazil"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          {t("wines.title")}
        </h1>
        <p className="text-muted">{t("wines.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <WineSearch />
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-6">
        <div>
          <span className="label-mono block mb-2">{t("wines.type")}</span>
          <div className="flex flex-wrap gap-1.5">
            {types.map((type) => (
              <Link
                key={type}
                href={`/vinhos?type=${type}${params.q ? `&q=${params.q}` : ""}`}
              >
                <Badge
                  variant={params.type === type ? "wine" : "muted"}
                >
                  {t(`wineTypes.${type}`)}
                </Badge>
              </Link>
            ))}
            {params.type && (
              <Link href={`/vinhos${params.q ? `?q=${params.q}` : ""}`}>
                <Badge variant="muted">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Badge>
              </Link>
            )}
          </div>
        </div>
        <div>
          <span className="label-mono block mb-2">{t("wines.country")}</span>
          <div className="flex flex-wrap gap-1.5">
            {countries.map((country) => (
              <Link
                key={country}
                href={`/vinhos?country=${country}${params.q ? `&q=${params.q}` : ""}${params.type ? `&type=${params.type}` : ""}`}
              >
                <Badge
                  variant={params.country === country ? "gold" : "muted"}
                >
                  {t(`countries.${country}`)}
                </Badge>
              </Link>
            ))}
            {params.country && (
              <Link
                href={`/vinhos${params.q ? `?q=${params.q}` : ""}${params.type ? `${params.q ? "&" : "?"}type=${params.type}` : ""}`}
              >
                <Badge variant="muted">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result.wines.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted">{t("common.noResults")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.wines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={{
                  ...wine,
                  bestPrice: wine.bestPrice
                    ? {
                        price: String(wine.bestPrice.price),
                        store: wine.bestPrice.store,
                      }
                    : null,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {result.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`/vinhos?page=${p}${params.q ? `&q=${params.q}` : ""}${params.type ? `&type=${params.type}` : ""}${params.country ? `&country=${params.country}` : ""}`}
                  >
                    <Button
                      variant={p === page ? "primary" : "outline"}
                      size="sm"
                    >
                      {p}
                    </Button>
                  </Link>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
