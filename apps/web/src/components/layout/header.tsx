"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isHome = pathname === "/" || pathname === "";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isHome
        ? "bg-[#1a0a10]/80 backdrop-blur-md border-b border-white/10"
        : "border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wine to-wine-light flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 6 6 6 9c0 3 2 5 4 6v4H8v2h8v-2h-2v-4c2-1 4-3 4-6 0-3-2-7-6-7z"/>
                </svg>
              </div>
              <span className={`font-heading text-xl font-semibold transition-colors ${
                isHome ? "text-white group-hover:text-gold" : "text-wine group-hover:text-wine-light"
              }`}>
                {t("common.appName")}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/vinhos"
                className={`text-sm font-medium transition-colors ${
                  isHome
                    ? "text-white/60 hover:text-white"
                    : pathname.startsWith("/vinhos") ? "text-wine" : "text-muted hover:text-foreground"
                }`}
              >
                {t("nav.wines")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher isHome={isHome} />

            {!loading && (
              <>
                {user ? (
                  <Link href="/painel">
                    <Button
                      variant={isHome ? "ghost" : "ghost"}
                      size="sm"
                      className={isHome ? "!text-white/70 hover:!text-white hover:!bg-white/10" : ""}
                    >
                      {t("common.myAlerts")}
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={isHome ? "!text-white/70 hover:!text-white hover:!bg-white/10" : ""}
                      >
                        {t("common.login")}
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button
                        size="sm"
                        className={isHome ? "!bg-white/10 !text-white hover:!bg-white/20 !border !border-white/10" : ""}
                      >
                        {t("common.signup")}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
