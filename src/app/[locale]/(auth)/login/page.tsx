"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { loginSchema, type Login } from "@/lib/validations";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      await signIn(data.email, data.password);
      router.push(`/${locale}/dashboard`);
    } catch {
      setError(t("invalid_credentials"));
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
            DC
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">Dental Clinic</h1>
        <p className="mt-1 text-sm text-blue-200/70">
          Management Platform
        </p>
      </div>

      <Card className="w-full border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl text-white">{t("sign_in_title")}</CardTitle>
          <CardDescription className="text-blue-200/60">
            {t("email")} & {t("password")}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-100/80">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                autoComplete="email"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-100/80">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
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

            <p className="text-center text-sm text-blue-200/60">
              {t("no_account")}{" "}
              <Link
                href={`/${locale}/register`}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                {t("sign_up")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
