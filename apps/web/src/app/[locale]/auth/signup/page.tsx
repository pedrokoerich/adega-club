import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🍷</span>
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
