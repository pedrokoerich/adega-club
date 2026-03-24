"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWinesPage() {
  const t = useTranslations("adminPanel");
  const tc = useTranslations("common");
  const tw = useTranslations("wineTypes");

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [producer, setProducer] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [region, setRegion] = useState("");
  const [grapes, setGrapes] = useState("");
  const [vintage, setVintage] = useState("");
  const [type, setType] = useState<"TINTO" | "BRANCO" | "ROSE" | "ESPUMANTE" | "SOBREMESA">("TINTO");

  const { data, isLoading } = trpc.admin.listWines.useQuery({ page, limit: 20 });
  const createWine = trpc.admin.createWine.useMutation();
  const deleteWine = trpc.admin.deleteWine.useMutation();
  const utils = trpc.useUtils();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createWine.mutateAsync({
      name,
      producer: producer || undefined,
      country: country || undefined,
      region: region || undefined,
      grapes: grapes ? grapes.split(",").map((g) => g.trim()) : [],
      vintage: vintage ? parseInt(vintage) : undefined,
      type,
    });
    setName("");
    setProducer("");
    setRegion("");
    setGrapes("");
    setVintage("");
    setShowForm(false);
    utils.admin.listWines.invalidate();
  }

  async function handleDelete(id: string) {
    await deleteWine.mutateAsync({ id });
    utils.admin.listWines.invalidate();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">{t("manageWines")}</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? tc("cancel") : t("addWine")}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="producer"
              label="Produtor"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
            />
            <Input
              id="country"
              label="País"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Input
              id="region"
              label="Região"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <Input
              id="grapes"
              label="Uvas (separadas por vírgula)"
              value={grapes}
              onChange={(e) => setGrapes(e.target.value)}
            />
            <Input
              id="vintage"
              label="Safra"
              type="number"
              value={vintage}
              onChange={(e) => setVintage(e.target.value)}
            />
            <div className="space-y-1">
              <label className="label-mono">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              >
                {["TINTO", "BRANCO", "ROSE", "ESPUMANTE", "SOBREMESA"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {tw(t)}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createWine.isPending} className="w-full">
                {createWine.isPending ? "..." : tc("save")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.wines.map((wine) => (
            <Card key={wine.id} className="!p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{wine.name}</h3>
                    <Badge variant="wine">{tw(wine.type)}</Badge>
                    {wine.vintage && (
                      <Badge variant="muted">{wine.vintage}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted mt-1">
                    {wine.producer && <span>{wine.producer}</span>}
                    <span>{wine._count.priceSnapshots} snapshots</span>
                    <span>{wine._count.priceAlerts} alertas</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(wine.id)}
                  disabled={deleteWine.isPending}
                >
                  {tc("delete")}
                </Button>
              </div>
            </Card>
          ))}

          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
