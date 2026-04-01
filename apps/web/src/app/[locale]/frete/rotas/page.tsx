"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "UY", name: "Uruguai" },
  { code: "PY", name: "Paraguai" },
  { code: "BO", name: "Bolívia" },
  { code: "CO", name: "Colômbia" },
  { code: "PE", name: "Peru" },
];

export default function MyRoutesPage() {
  const t = useTranslations("freighter");
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = trpc.freighter.myProfile.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: routes, isLoading: routesLoading } = trpc.freighter.myRoutes.useQuery(
    undefined,
    { enabled: !!user }
  );

  const utils = trpc.useUtils();

  const registerMutation = trpc.freighter.register.useMutation({
    onSuccess: () => {
      utils.freighter.myProfile.invalidate();
    },
  });

  const createRouteMutation = trpc.freighter.createRoute.useMutation({
    onSuccess: () => {
      utils.freighter.myRoutes.invalidate();
      setShowForm(false);
      resetForm();
    },
  });

  const removeRouteMutation = trpc.freighter.removeRoute.useMutation({
    onSuccess: () => utils.freighter.myRoutes.invalidate(),
  });

  const updateRouteMutation = trpc.freighter.updateRoute.useMutation({
    onSuccess: () => utils.freighter.myRoutes.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [originCity, setOriginCity] = useState("");
  const [originCountry, setOriginCountry] = useState("BR");
  const [destCity, setDestCity] = useState("");
  const [destCountry, setDestCountry] = useState("AR");
  const [maxBottles, setMaxBottles] = useState("");
  const [pricePerBottle, setPricePerBottle] = useState("");
  const [frequency, setFrequency] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setOriginCity("");
    setDestCity("");
    setMaxBottles("");
    setPricePerBottle("");
    setFrequency("");
  }

  function handleCreateRoute(e: React.FormEvent) {
    e.preventDefault();
    createRouteMutation.mutate({
      originCity,
      originCountry,
      destCity,
      destCountry,
      maxBottles: maxBottles ? parseInt(maxBottles) : undefined,
      pricePerBottleUsd: pricePerBottle ? parseFloat(pricePerBottle) : undefined,
      frequency: frequency || undefined,
    });
  }

  if (authLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("myRoutes")}</h1>
        <Link href="/auth/login"><Button>Entrar para continuar</Button></Link>
      </div>
    );
  }

  // Not yet a freighter — show registration
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("becomeFreighter")}</h1>
        <Card>
          <p className="text-muted mb-6">{t("becomeFreighterDesc")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              registerMutation.mutate({
                vehicleType: vehicleType || undefined,
                description: description || undefined,
              });
            }}
            className="space-y-4"
          >
            <Input
              id="vehicleType"
              label={t("vehicleType")}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder={t("vehicleTypeHint")}
            />
            <div className="space-y-1">
              <label className="label-mono">{t("description")}</label>
              <textarea
                className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionHint")}
              />
            </div>
            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "..." : t("register")}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("myRoutes")}</h1>
          <p className="text-muted">
            {profile.totalDeliveries} {t("deliveries")} |{" "}
            {profile.verificationStatus === "VERIFIED" ? t("verified") : t("pendingVerification")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/frete">
            <Button variant="outline">{t("browseRoutes")}</Button>
          </Link>
          <Button onClick={() => setShowForm(!showForm)}>{t("newRoute")}</Button>
        </div>
      </div>

      {/* New route form */}
      {showForm && (
        <Card className="mb-8">
          <h3 className="font-heading text-lg font-semibold mb-4">{t("newRoute")}</h3>
          <form onSubmit={handleCreateRoute} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-mono mb-1 block">{t("originCountry")}</label>
                <select
                  className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Input
                id="originCity"
                label={t("originCity")}
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="São Paulo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-mono mb-1 block">{t("destCountry")}</label>
                <select
                  className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
                  value={destCountry}
                  onChange={(e) => setDestCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Input
                id="destCity"
                label={t("destCity")}
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                placeholder="Buenos Aires"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="maxBottles"
                label={t("maxBottles")}
                type="number"
                min="1"
                value={maxBottles}
                onChange={(e) => setMaxBottles(e.target.value)}
              />
              <Input
                id="pricePerBottle"
                label={t("pricePerBottle")}
                type="number"
                step="0.01"
                min="0"
                value={pricePerBottle}
                onChange={(e) => setPricePerBottle(e.target.value)}
              />
              <Input
                id="frequency"
                label={t("frequency")}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder={t("frequencyHint")}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createRouteMutation.isPending}>
                {createRouteMutation.isPending ? "..." : t("createRoute")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Existing routes */}
      {routesLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !routes?.length ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noRoutes")}</p>
          <p className="text-sm text-muted">{t("createFirstRoute")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <Card key={route.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {route.originCity}, {COUNTRIES.find((c) => c.code === route.originCountry)?.name}
                    </span>
                    <span className="text-muted">&rarr;</span>
                    <span className="font-semibold">
                      {route.destCity}, {COUNTRIES.find((c) => c.code === route.destCountry)?.name}
                    </span>
                    <Badge variant={route.isActive ? "green" : "muted"}>
                      {route.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    {route.frequency && <span>{route.frequency}</span>}
                    {route.maxBottles && <span>{route.maxBottles} {t("bottles")}</span>}
                    {route.pricePerBottleUsd && (
                      <span className="text-wine font-semibold">
                        $ {Number(route.pricePerBottleUsd).toFixed(2)} /{t("bottle")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateRouteMutation.mutate({
                      id: route.id,
                      isActive: !route.isActive,
                    })}
                  >
                    {route.isActive ? t("pause") : t("activate")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRouteMutation.mutate({ id: route.id })}
                  >
                    {t("remove")}
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
