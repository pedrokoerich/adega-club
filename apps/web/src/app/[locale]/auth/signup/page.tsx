import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wine to-wine-light flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8 2 6 6 6 9c0 3 2 5 4 6v4H8v2h8v-2h-2v-4c2-1 4-3 4-6 0-3-2-7-6-7z"/>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold">{t("signupTitle")}</h1>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-muted mt-4">
          {t("hasAccount")}{" "}
          <Link href="/auth/login" className="text-wine hover:underline font-medium">
            {t("loginButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}
