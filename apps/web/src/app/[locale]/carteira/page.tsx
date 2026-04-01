"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";

const TX_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  DEPOSIT: { label: "Depósito", color: "text-green-600" },
  WITHDRAWAL: { label: "Saque", color: "text-red-600" },
  PURCHASE: { label: "Compra", color: "text-red-600" },
  SALE_CREDIT: { label: "Venda", color: "text-green-600" },
  COMMISSION: { label: "Comissão", color: "text-amber-600" },
  REFUND: { label: "Reembolso", color: "text-green-600" },
  FREIGHT_PAYMENT: { label: "Frete", color: "text-blue-600" },
};

export default function WalletPage() {
  const t = useTranslations("marketplace");
  const { user, loading: authLoading } = useAuth();
  const [depositAmount, setDepositAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);

  const { data: balance, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: txData, isLoading: txLoading } = trpc.wallet.transactions.useQuery(
    { page: 1, limit: 20 },
    { enabled: !!user }
  );

  const [depositLoading, setDepositLoading] = useState(false);

  async function handleStripeDeposit() {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 5) return;
    setDepositLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Deposit error:", err);
    } finally {
      setDepositLoading(false);
    }
  }

  if (authLoading || balanceLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("myWallet")}</h1>
        <Link href="/auth/login"><Button>Entrar para continuar</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">{t("myWallet")}</h1>

      {/* Balance card */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 grid grid-cols-3 gap-6 w-full text-center">
            <div>
              <p className="text-sm text-muted">{t("available")}</p>
              <p className="text-2xl font-bold text-green-600">
                $ {balance?.availableUsd.toFixed(2) ?? "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("locked")}</p>
              <p className="text-2xl font-bold text-amber-600">
                $ {Number(balance?.lockedUsd ?? 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("balance")}</p>
              <p className="text-2xl font-bold">
                $ {Number(balance?.balanceUsd ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowDeposit(!showDeposit)}>
              {t("deposit")}
            </Button>
            <Button variant="outline">
              {t("withdraw")}
            </Button>
          </div>
        </div>

        {showDeposit && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  id="depositAmount"
                  label="Valor (USD) - mín. $5.00"
                  type="number"
                  step="0.01"
                  min="5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100.00"
                />
              </div>
              <Button
                onClick={handleStripeDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) < 5 || depositLoading}
              >
                {depositLoading ? "..." : "Pagar com Stripe"}
              </Button>
            </div>
            <p className="text-xs text-muted mt-2">
              Pagamento seguro via Stripe. Aceita cartão de crédito e débito.
            </p>
          </div>
        )}
      </Card>

      {/* Transactions */}
      <h2 className="font-heading text-xl font-bold mb-4">{t("transactions")}</h2>

      {txLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : !txData?.transactions.length ? (
        <Card className="text-center py-8">
          <p className="text-muted">{t("noTransactions")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {txData.transactions.map((tx) => {
            const info = TX_TYPE_LABELS[tx.type] ?? { label: tx.type, color: "text-foreground" };
            const amount = Number(tx.amountUsd);
            return (
              <Card key={tx.id} className="!py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">{info.label}</Badge>
                      {tx.description && (
                        <span className="text-sm text-muted truncate max-w-[200px]">
                          {tx.description}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {new Date(tx.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <p className={`font-mono font-semibold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {amount >= 0 ? "+" : ""}$ {Math.abs(amount).toFixed(2)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
