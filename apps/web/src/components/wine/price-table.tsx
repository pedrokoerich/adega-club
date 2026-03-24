import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";

interface PriceEntry {
  store: string;
  priceBrl: string | number;
  url: string | null;
  inStock: boolean;
  scrapedAt: string | Date;
}

interface PriceTableProps {
  prices: PriceEntry[];
}

const storeNames: Record<string, string> = {
  evino: "Evino",
  wine: "Wine.com.br",
  vivino: "Vivino",
  divvino: "Divvino",
};

export function PriceTable({ prices }: PriceTableProps) {
  const t = useTranslations("wineDetail");

  if (prices.length === 0) return null;

  const cheapest = prices
    .filter((p) => p.inStock)
    .sort((a, b) => Number(a.priceBrl) - Number(b.priceBrl))[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="label-mono text-left py-3 px-4">{t("store")}</th>
            <th className="label-mono text-left py-3 px-4">{t("price")}</th>
            <th className="label-mono text-left py-3 px-4">{t("status")}</th>
            <th className="label-mono text-left py-3 px-4">{t("lastUpdate")}</th>
            <th className="label-mono text-right py-3 px-4">{t("action")}</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => {
            const isCheapest =
              cheapest && price.store === cheapest.store && price.inStock;
            return (
              <tr
                key={price.store}
                className={`border-b border-border last:border-0 ${
                  isCheapest ? "bg-green-pale" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {storeNames[price.store] ?? price.store}
                    </span>
                    {isCheapest && (
                      <Badge variant="green">{t("bestPriceBadge")}</Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-lg font-heading font-bold ${
                      isCheapest ? "text-green" : "text-foreground"
                    }`}
                  >
                    {formatBRL(price.priceBrl)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {price.inStock ? (
                    <Badge variant="green">
                      {t("status") === "Status" ? "In stock" : "Em estoque"}
                    </Badge>
                  ) : (
                    <Badge variant="muted">
                      {t("status") === "Status" ? "Out of stock" : "Fora de estoque"}
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-muted">
                    {formatDate(price.scrapedAt)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {price.url && (
                    <a
                      href={price.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-sm text-wine hover:text-wine-light font-medium transition-colors"
                    >
                      {t("visitStore")} →
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
