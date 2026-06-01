"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { loginSchema, type Login } from "@/lib/validations";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthBrand,
  AuthCard,
  AuthFooterLink,
} from "@/components/auth/auth-shell";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: Login) => {
    try {
      setError(null);
      const user = await signIn(data.email, data.password);

      if (!user.email_confirmed_at) {
        router.push(`/${locale}/verify-email`);
        return;
      }

      router.push(`/${locale}/dashboard`);
    } catch {
      setError(t("invalid_credentials"));
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <AuthBrand />

      <AuthCard title={t("sign_in_title")} description={t("sign_in_subtitle")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                autoComplete="email"
                className="h-11 border-slate-200 bg-white"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 border-slate-200 bg-white"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <Button
              type="submit"
              className="h-11 w-full bg-teal-600 text-white hover:bg-teal-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("sign_in")}...
                </>
              ) : (
                t("sign_in")
              )}
            </Button>

            <AuthFooterLink
              prompt={t("no_account")}
              href={`/${locale}/register`}
              label={t("sign_up")}
            />
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
