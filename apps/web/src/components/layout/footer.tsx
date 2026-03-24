import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wine to-wine-light flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 6 6 6 9c0 3 2 5 4 6v4H8v2h8v-2h-2v-4c2-1 4-3 4-6 0-3-2-7-6-7z"/>
                </svg>
              </div>
              <span className="font-heading text-lg font-semibold text-wine">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="label-mono mb-4">{t("footer.links")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/vinhos"
                  className="text-sm text-muted hover:text-wine transition-colors"
                >
                  {t("nav.wines")}
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-muted hover:text-wine transition-colors"
                >
                  {t("common.signup")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label-mono mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-muted">{t("footer.privacy")}</span>
              </li>
              <li>
                <span className="text-sm text-muted">{t("footer.terms")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted">
            {t("footer.copyright", { year })}
          </p>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted/50">
            <span>Evino</span>
            <span>Wine.com.br</span>
            <span>Vivino</span>
            <span>Divvino</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
