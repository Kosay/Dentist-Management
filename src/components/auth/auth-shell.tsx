"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AuthLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="gap-2 border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
    >
      <Languages className="size-4" />
      {locale === "en" ? "العربية" : "English"}
    </Button>
  );
}

export function AuthBrand() {
  const t = useTranslations("auth");

  return (
    <div className="text-center">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-600 text-xl font-bold text-white shadow-lg shadow-teal-600/20">
          DC
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t("brand_title")}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{t("brand_subtitle")}</p>
    </div>
  );
}

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-8">{children}</div>

      {footer ? <div className="mt-6 border-t border-slate-100 pt-6">{footer}</div> : null}
    </div>
  );
}

type AuthFooterLinkProps = {
  prompt: string;
  href: string;
  label: string;
};

export function AuthFooterLink({ prompt, href, label }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-slate-600">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-teal-700 hover:text-teal-800 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
