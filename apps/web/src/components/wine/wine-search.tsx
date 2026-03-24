"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { trpc } from "@/lib/trpc/client";

interface WineSearchProps {
  placeholder?: string;
  className?: string;
  size?: "md" | "lg";
  variant?: "light" | "dark";
}

export function WineSearch({ placeholder, className, size = "md", variant = "light" }: WineSearchProps) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions } = trpc.wine.search.useQuery(
    { q: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/vinhos?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  function handleSelect(slug: string) {
    router.push(`/vinhos/${slug}`);
    setQuery("");
  }

  const isDark = variant === "dark";
  const inputSize = size === "lg" ? "h-16 text-lg px-7" : "h-11 text-sm px-4";
  const iconSize = size === "lg" ? "h-5 w-5 left-5" : "h-4 w-4 left-4";
  const iconPad = size === "lg" ? "pl-14" : "pl-11";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <svg
          className={`absolute top-1/2 -translate-y-1/2 ${iconSize} ${isDark ? "text-white/40" : "text-muted"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? t("common.searchPlaceholder")}
          className={`w-full rounded-2xl font-body transition-all duration-200 ${iconPad} ${inputSize} ${
            isDark
              ? "bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 focus:bg-white/15"
              : "bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine"
          }`}
        />
        {size === "lg" && (
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isDark
                ? "bg-gold text-white hover:bg-gold/90"
                : "bg-wine text-white hover:bg-wine-light"
            }`}
          >
            {t("common.search")}
          </button>
        )}
      </div>

      {suggestions && suggestions.length > 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
          {suggestions.map((wine) => (
            <button
              key={wine.id}
              type="button"
              onClick={() => handleSelect(wine.slug)}
              className="w-full px-5 py-3.5 text-left hover:bg-surface-2 transition-colors flex items-center justify-between border-b border-border/50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {wine.name}
                </p>
                {wine.producer && (
                  <p className="text-xs text-muted mt-0.5">{wine.producer}</p>
                )}
              </div>
              <span className="tag-wine text-[10px]">
                {t(`wineTypes.${wine.type}`)}
              </span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
