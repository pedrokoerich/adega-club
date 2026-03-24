"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AlertButtonProps {
  wineId: string;
}

export function AlertButton({ wineId }: AlertButtonProps) {
  const t = useTranslations("wineDetail");
  const { user } = useAuth();
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [success, setSuccess] = useState(false);

  const createAlert = trpc.alert.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setShowInput(false);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  function handleClick() {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!showInput) {
      setShowInput(true);
      return;
    }
    createAlert.mutate({
      wineId,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
    });
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green font-medium text-sm">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {t("alertCreated")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showInput && (
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder={t("targetPrice")}
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />
      )}
      <Button
        onClick={handleClick}
        disabled={createAlert.isPending}
        className="w-full"
      >
        {createAlert.isPending ? "..." : t("alertButton")}
      </Button>
    </div>
  );
}
