import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-gradient-to-b from-surface to-surface-2 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wine to-wine-light flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8 2 6 6 6 9c0 3 2 5 4 6v4H8v2h8v-2h-2v-4c2-1 4-3 4-6 0-3-2-7-6-7z"/>
              </svg>
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">
              {t("common.appName")}
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/vinhos"
              className="text-sm text-muted hover:text-wine transition-colors"
            >
              {t("nav.wines")}
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm text-muted hover:text-wine transition-colors"
            >
              {t("common.signup")}
            </Link>
            <span className="text-sm text-muted/60">{t("footer.privacy")}</span>
            <span className="text-sm text-muted/60">{t("footer.terms")}</span>
          </nav>
        </div>

        <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted/70">
            {t("footer.copyright", { year })}
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted/40">
            <span>Evino</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted/30" />
            <span className="hidden sm:inline">Wine.com.br</span>
            <span className="sm:hidden">Wine</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted/30" />
            <span>Vivino</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted/30" />
            <span>Divvino</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
