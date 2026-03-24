"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const locales = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

export function LanguageSwitcher({ isHome = false }: { isHome?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${
      isHome ? "border border-white/10 bg-white/5" : "border border-border bg-surface"
    }`}>
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all duration-200 ${
            locale === l.code
              ? isHome
                ? "bg-white/15 text-white shadow-sm"
                : "bg-wine text-white shadow-sm"
              : isHome
                ? "text-white/40 hover:text-white/70"
                : "text-muted hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
