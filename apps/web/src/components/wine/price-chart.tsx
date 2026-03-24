"use client";

import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PriceChartProps {
  data: Record<string, { date: string; price: number }[]>;
}

const storeColors: Record<string, string> = {
  evino: "#7b1d3a",
  wine: "#b8943f",
  vivino: "#2d6a4f",
  divvino: "#1d4e89",
};

const storeNames: Record<string, string> = {
  evino: "Evino",
  wine: "Wine.com.br",
  vivino: "Vivino",
  divvino: "Divvino",
};

export function PriceChart({ data }: PriceChartProps) {
  const t = useTranslations("wineDetail");
  const stores = Object.keys(data);

  if (stores.length === 0) return null;

  // Merge all dates into a unified dataset
  const allDates = new Set<string>();
  stores.forEach((store) =>
    data[store].forEach((d) => allDates.add(d.date))
  );

  const chartData = Array.from(allDates)
    .sort()
    .map((date) => {
      const point: Record<string, string | number> = { date };
      stores.forEach((store) => {
        const entry = data[store].find((d) => d.date === date);
        if (entry) point[store] = entry.price;
      });
      return point;
    });

  return (
    <div>
      <h3 className="font-heading text-xl font-semibold mb-1">
        {t("priceHistory")}
      </h3>
      <p className="text-sm text-muted mb-4">{t("last30days")}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ce" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#8a7e72" }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8a7e72" }}
              tickFormatter={(val) => `R$${val}`}
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(value))
              }
            />
            <Legend />
            {stores.map((store) => (
              <Line
                key={store}
                type="monotone"
                dataKey={store}
                name={storeNames[store] ?? store}
                stroke={storeColors[store] ?? "#8a7e72"}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
