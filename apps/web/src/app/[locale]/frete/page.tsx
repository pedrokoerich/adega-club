"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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

export default function FreightPage() {
  const t = useTranslations("freighter");
  const { user } = useAuth();
  const [originCountry, setOriginCountry] = useState("");
  const [destCountry, setDestCountry] = useState("");

  const { data, isLoading } = trpc.freighter.searchRoutes.useQuery({
    originCountry: originCountry || undefined,
    destCountry: destCountry || undefined,
  });

  const { data: myProfile } = trpc.freighter.myProfile.useQuery(undefined, {
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </div>
        {user && !myProfile && (
          <Link href="/frete/rotas">
            <Button>{t("becomeFreighter")}</Button>
          </Link>
        )}
        {myProfile && (
          <Link href="/frete/rotas">
            <Button>{t("myRoutes")}</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-mono mb-1 block">{t("origin")}</label>
            <select
              className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
            >
              <option value="">{t("allCountries")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-mono mb-1 block">{t("destination")}</label>
            <select
              className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value)}
            >
              <option value="">{t("allCountries")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Info card about freelance freighter */}
      <Card variant="wine" className="mb-8">
        <h3 className="font-heading text-lg font-semibold mb-2">{t("howItWorks")}</h3>
        <p className="text-sm text-muted">{t("howItWorksDesc")}</p>
      </Card>

      {/* Routes */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !data?.routes.length ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noRoutes")}</p>
          <p className="text-sm text-muted">{t("noRoutesDesc")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.routes.map((route) => (
            <Card key={route.id}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {route.originCity}, {COUNTRIES.find((c) => c.code === route.originCountry)?.name ?? route.originCountry}
                    </span>
                    <span className="text-muted">&rarr;</span>
                    <span className="font-semibold">
                      {route.destCity}, {COUNTRIES.find((c) => c.code === route.destCountry)?.name ?? route.destCountry}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    {route.frequency && <span>{route.frequency}</span>}
                    {route.maxBottles && <span>{t("upTo")} {route.maxBottles} {t("bottles")}</span>}
                    {route.departureDate && (
                      <span>{t("departure")}: {new Date(route.departureDate).toLocaleDateString("pt-BR")}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {route.freighter.verificationStatus === "VERIFIED" && (
                      <Badge variant="green" className="text-[10px]">{t("verified")}</Badge>
                    )}
                    {route.freighter.rating && (
                      <span className="text-xs text-muted flex items-center gap-1">
                        <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {route.freighter.rating.toFixed(1)} ({route.freighter.totalDeliveries} {t("deliveries")})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {route.pricePerBottleUsd && (
                    <p className="text-lg font-bold text-wine">
                      $ {Number(route.pricePerBottleUsd).toFixed(2)}
                      <span className="text-xs text-muted font-normal"> /{t("bottle")}</span>
                    </p>
                  )}
                  <Button size="sm" className="mt-2">{t("contact")}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
