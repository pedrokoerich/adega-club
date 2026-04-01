"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DOCUMENT_TYPES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  BR: [{ value: "CPF", label: "CPF" }, { value: "CNPJ", label: "CNPJ" }],
  AR: [{ value: "DNI", label: "DNI" }],
  CL: [{ value: "RUT", label: "RUT" }],
  UY: [{ value: "CI", label: "CI" }],
  PY: [{ value: "CI", label: "CI" }],
  BO: [{ value: "CI", label: "CI" }],
};

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "PE", name: "Peru" },
  { code: "CO", name: "Colombia" },
];

export default function SellerPage() {
  const t = useTranslations("seller");
  const { user, loading: authLoading } = useAuth();
  const [country, setCountry] = useState("BR");
  const [sellerType, setSellerType] = useState<"INDIVIDUAL" | "BUSINESS">("INDIVIDUAL");
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("CPF");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const { data: stats, isLoading: statsLoading } = trpc.seller.stats.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: profile, isLoading: profileLoading } = trpc.seller.getProfile.useQuery(
    undefined,
    { enabled: !!user }
  );

  const registerMutation = trpc.seller.register.useMutation({
    onError: (err) => setError(err.message),
  });

  const docTypes = DOCUMENT_TYPES_BY_COUNTRY[country] || [{ value: "PASSPORT", label: "Passport" }];

  if (authLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("becomeSeller")}</h1>
        <p className="text-muted mb-6">{t("becomeSellerDesc")}</p>
        <Link href="/auth/login">
          <Button>Entrar para continuar</Button>
        </Link>
      </div>
    );
  }

  // Already a seller - show dashboard
  if (profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">{t("sellerDashboard")}</h1>
            <p className="text-muted">{profile.storeName}</p>
          </div>
          <Link href="/vender/anuncios/novo">
            <Button>{t("newListing")}</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-wine">{statsLoading ? "..." : stats?.activeListings ?? 0}</p>
              <p className="text-sm text-muted">{t("activeListings")}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold">{statsLoading ? "..." : stats?.totalOrders ?? 0}</p>
              <p className="text-sm text-muted">{t("totalOrders")}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{statsLoading ? "..." : stats?.pendingOrders ?? 0}</p>
              <p className="text-sm text-muted">{t("pendingOrders")}</p>
            </div>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/vender/anuncios">
            <Card className="hover:border-wine/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <div>
                  <p className="font-semibold">{t("myListings")}</p>
                  <p className="text-sm text-muted">Gerenciar seus anúncios</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/pedidos">
            <Card className="hover:border-wine/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <div>
                  <p className="font-semibold">{t("incomingOrders")}</p>
                  <p className="text-sm text-muted">Ver pedidos recebidos</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Registration form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    registerMutation.mutate({
      storeName,
      description: description || undefined,
      sellerType,
      documentType: documentType as "CPF" | "CNPJ" | "DNI" | "RUT" | "CI" | "PASSPORT",
      documentNumber,
      country,
      phone: phone || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold">{t("becomeSeller")}</h1>
        <p className="text-muted mt-2">{t("becomeSellerDesc")}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="storeName"
            label={t("storeName")}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder={t("storeNameHint")}
            required
          />

          <div className="space-y-1">
            <label className="label-mono">{t("description")}</label>
            <textarea
              className="flex w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <label className="label-mono">{t("sellerType")}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSellerType("INDIVIDUAL")}
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                  sellerType === "INDIVIDUAL"
                    ? "border-wine bg-wine/5 text-wine"
                    : "border-border hover:border-wine/30"
                }`}
              >
                <p className="font-semibold">{t("individual")}</p>
              </button>
              <button
                type="button"
                onClick={() => setSellerType("BUSINESS")}
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                  sellerType === "BUSINESS"
                    ? "border-wine bg-wine/5 text-wine"
                    : "border-border hover:border-wine/30"
                }`}
              >
                <p className="font-semibold">{t("business")}</p>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="label-mono">{t("country")}</label>
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                const newDocs = DOCUMENT_TYPES_BY_COUNTRY[e.target.value];
                setDocumentType(newDocs ? newDocs[0].value : "PASSPORT");
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label-mono">{t("documentType")}</label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {docTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <Input
              id="documentNumber"
              label={t("documentNumber")}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              required
            />
          </div>

          <Input
            id="phone"
            label={t("phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "..." : t("register")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
