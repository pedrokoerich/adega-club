"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const locales = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg p-0.5 border border-border bg-surface">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all duration-200 ${
            locale === l.code
              ? "bg-wine text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
