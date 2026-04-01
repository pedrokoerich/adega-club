"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function NewListingPage() {
  const t = useTranslations("listing");
  const router = useRouter();

  const [wineQuery, setWineQuery] = useState("");
  const [selectedWine, setSelectedWine] = useState<{ id: string; name: string; producer: string | null } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<"SEALED" | "EXCELLENT" | "GOOD">("SEALED");
  const [shipsFrom, setShipsFrom] = useState("");
  const [error, setError] = useState("");

  const { data: searchResults } = trpc.wine.search.useQuery(
    { q: wineQuery },
    { enabled: wineQuery.length >= 2 }
  );

  const createListing = trpc.listing.create.useMutation({
    onSuccess: () => router.push("/vender/anuncios"),
    onError: (err) => setError(err.message),
  });

  function handleSelectWine(wine: { id: string; name: string; producer: string | null }) {
    setSelectedWine(wine);
    if (!title) setTitle(wine.name);
    setWineQuery("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWine) return setError("Selecione um vinho");
    setError("");

    createListing.mutate({
      wineId: selectedWine.id,
      title,
      description: description || undefined,
      priceUsd: parseFloat(priceUsd),
      quantity: parseInt(quantity),
      condition,
      shipsFrom: shipsFrom || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">{t("createListing")}</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Wine selection */}
          <div className="space-y-1">
            <label className="label-mono">{t("selectWine")}</label>
            {selectedWine ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-wine/30 bg-wine/5">
                <div>
                  <p className="font-semibold">{selectedWine.name}</p>
                  {selectedWine.producer && (
                    <p className="text-sm text-muted">{selectedWine.producer}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWine(null)}
                >
                  Trocar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="wineSearch"
                  value={wineQuery}
                  onChange={(e) => setWineQuery(e.target.value)}
                  placeholder={t("searchWine")}
                />
                {searchResults && searchResults.length > 0 && wineQuery.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((wine) => (
                      <button
                        key={wine.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors border-b border-border last:border-0"
                        onClick={() => handleSelectWine(wine)}
                      >
                        <p className="font-semibold text-sm">{wine.name}</p>
                        {wine.producer && (
                          <p className="text-xs text-muted">{wine.producer}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Input
            id="title"
            label={t("title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titleHint")}
            required
          />

          <div className="space-y-1">
            <label className="label-mono">{t("description")}</label>
            <textarea
              className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionHint")}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="priceUsd"
              label={t("priceUsd")}
              type="number"
              step="0.01"
              min="0.01"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              required
            />
            <Input
              id="quantity"
              label={t("quantity")}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="label-mono">{t("condition")}</label>
            <div className="grid grid-cols-3 gap-3">
              {(["SEALED", "EXCELLENT", "GOOD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`p-3 rounded-lg border text-sm text-center transition-colors ${
                    condition === c
                      ? "border-wine bg-wine/5 text-wine font-semibold"
                      : "border-border hover:border-wine/30"
                  }`}
                >
                  {t(c === "SEALED" ? "sealed" : c === "EXCELLENT" ? "excellent" : "good")}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="shipsFrom"
            label={t("shipsFrom")}
            value={shipsFrom}
            onChange={(e) => setShipsFrom(e.target.value)}
            placeholder={t("shipsFromHint")}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createListing.isPending || !selectedWine}
          >
            {createListing.isPending ? "..." : t("publish")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
