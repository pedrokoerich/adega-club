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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-wine to-wine-light flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 6 6 6 9c0 3 2 5 4 6v4H8v2h8v-2h-2v-4c2-1 4-3 4-6 0-3-2-7-6-7z"/>
                </svg>
              </div>
              <span className="font-heading text-lg sm:text-xl font-semibold text-wine group-hover:text-wine-light transition-colors">
                <span className="sm:hidden">AC</span>
                <span className="hidden sm:inline">{t("common.appName")}</span>
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/vinhos"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith("/vinhos") ? "text-wine" : "text-muted hover:text-foreground"
                }`}
              >
                {t("nav.wines")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {!loading && (
              <>
                {user ? (
                  <Link href="/painel">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <span className="sm:hidden">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </span>
                      <span className="hidden sm:inline">{t("common.myAlerts")}</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs sm:text-sm !px-2.5 sm:!px-3"
                      >
                        {t("common.login")}
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button
                        size="sm"
                        className="text-xs sm:text-sm !px-2.5 sm:!px-3"
                      >
                        <span className="sm:hidden">Criar</span>
                        <span className="hidden sm:inline">{t("common.signup")}</span>
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
