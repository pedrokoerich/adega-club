import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WineSearch } from "@/components/wine/wine-search";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a10] via-[#3d1225] to-[#5a1029] noise-overlay">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-wine/20 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gold/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold/90">
              Comparador de vinhos
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 gradient-text">
            {t("heroTitle")}
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {t("heroSubtitle")}
          </p>

          <div className="max-w-xl mx-auto">
            <WineSearch
              placeholder={t("heroSearch")}
              size="lg"
              variant="dark"
            />
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-10 text-white/40 font-mono text-[10px] sm:text-xs uppercase tracking-widest">
            <span>Evino</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="hidden sm:inline">Wine.com.br</span>
            <span className="sm:hidden">Wine</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Vivino</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Divvino</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Stats bar */}
      <section className="relative -mt-8 z-20 mx-auto max-w-4xl px-4">
        <div className="glass rounded-2xl px-6 sm:px-8 py-6 shadow-xl">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="text-center px-2 sm:px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-wine">50+</p>
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mt-1">Vinhos</p>
            </div>
            <div className="text-center px-2 sm:px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-wine">4</p>
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mt-1">Lojas</p>
            </div>
            <div className="text-center px-2 sm:px-4">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-wine">40%</p>
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted mt-1">Economia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wine showcase with images */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="label-mono text-wine">{t("howItWorks")}</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-3">
              Simples, rapido e gratuito
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: t("valueProp1Title"),
                desc: t("valueProp1Desc"),
                gradient: "from-wine/10 to-transparent",
                accent: "text-wine",
                border: "group-hover:border-wine/30",
              },
              {
                num: "02",
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: t("valueProp2Title"),
                desc: t("valueProp2Desc"),
                gradient: "from-gold/10 to-transparent",
                accent: "text-gold",
                border: "group-hover:border-gold/30",
              },
              {
                num: "03",
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: t("valueProp3Title"),
                desc: t("valueProp3Desc"),
                gradient: "from-green/10 to-transparent",
                accent: "text-green",
                border: "group-hover:border-green/30",
              },
            ].map((prop) => (
              <div
                key={prop.num}
                className={`group relative rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${prop.border} overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-xl bg-surface-2 ${prop.accent}`}>
                      {prop.icon}
                    </div>
                    <span className="font-mono text-3xl font-light text-border">
                      {prop.num}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-semibold mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-sm">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - SVG icons instead of emojis */}
      <section className="py-20 bg-gradient-to-b from-surface-2/50 to-bg">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="label-mono text-gold">Passo a passo</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-3">
              {t("howItWorks")}
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
              {[
                {
                  step: t("step1"),
                  desc: t("step1Desc"),
                  color: "text-wine",
                  bg: "bg-wine-pale",
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                },
                {
                  step: t("step2"),
                  desc: t("step2Desc"),
                  color: "text-gold",
                  bg: "bg-gold-pale",
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h2v8H3V13zm6-4h2v12H9V9zm6-2h2v14h-2V7zm6-4h2v18h-2V3z" />
                    </svg>
                  ),
                },
                {
                  step: t("step3"),
                  desc: t("step3Desc"),
                  color: "text-green",
                  bg: "bg-green-pale",
                  icon: (
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${item.bg} ${item.color} border border-border/50 shadow-sm mb-6 relative z-10`}>
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-semibold mb-2">
                    {item.step}
                  </h3>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wine images showcase */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-mono text-wine mb-3 block">Descubra</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
                Os melhores vinhos sul-americanos
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                Argentina, Chile e Uruguai produzem alguns dos melhores vinhos do mundo.
                Compare precos entre as principais lojas do Brasil e encontre a melhor oferta.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/vinhos?country=Argentina">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-4 py-2 text-sm hover:border-wine/30 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-wine" />
                    Argentina
                  </span>
                </Link>
                <Link href="/vinhos?country=Chile">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-4 py-2 text-sm hover:border-gold/30 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    Chile
                  </span>
                </Link>
                <Link href="/vinhos?country=Uruguay">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-4 py-2 text-sm hover:border-green/30 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-green" />
                    Uruguai
                  </span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-[#3d1225] to-[#1a0a10] flex items-end p-5">
                  <div>
                    <p className="font-heading text-lg text-white/90 font-semibold">Malbec</p>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-wider mt-1">Mendoza, AR</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/3] bg-gradient-to-br from-[#b8943f]/20 to-[#f7f3ee] border border-border flex items-end p-5">
                  <div>
                    <p className="font-heading text-lg text-foreground font-semibold">Chardonnay</p>
                    <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">Casablanca, CL</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden aspect-[3/3] bg-gradient-to-br from-[#a8294f]/20 to-[#f7f3ee] border border-border flex items-end p-5">
                  <div>
                    <p className="font-heading text-lg text-foreground font-semibold">Tannat</p>
                    <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">Canelones, UY</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-[#2d6a4f] to-[#1a0a10] flex items-end p-5">
                  <div>
                    <p className="font-heading text-lg text-white/90 font-semibold">Carmenere</p>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-wider mt-1">Colchagua, CL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0a10] via-[#3d1225] to-[#5a1029] p-10 sm:p-12 lg:p-16 text-center noise-overlay">
            <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-gold/10 blur-[80px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-wine/20 blur-[80px]" />

            <div className="relative z-10">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 gradient-text">
                {t("ctaTitle")}
              </h2>
              <p className="text-base sm:text-lg text-white/60 mb-10 max-w-lg mx-auto">
                {t("ctaSubtitle")}
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="!bg-gradient-to-r !from-gold !to-gold/80 !text-white hover:!from-gold/90 hover:!to-gold/70 !px-10 !py-4 !text-base !rounded-xl !shadow-lg">
                  {t("ctaButton")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
