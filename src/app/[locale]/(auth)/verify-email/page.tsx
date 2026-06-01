"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { AuthBrand, AuthCard } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { user, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;

    try {
      setIsSending(true);
      setError(null);
      setMessage(null);

      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (resendError) throw resendError;
      setMessage(t("verification_sent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verification_resend_failed"));
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = `/${locale}/login`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <AuthBrand />

      <AuthCard
        title={t("verify_email_title")}
        description={t("verify_email_description")}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-teal-50 px-4 py-6 text-center">
            <MailCheck className="size-10 text-teal-600" />
            <p className="text-sm text-slate-600">{t("verify_email_help")}</p>
            {user?.email ? (
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
            ) : null}
          </div>

          {message ? (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              className="h-11 w-full bg-teal-600 text-white hover:bg-teal-700"
              disabled={isSending || !user?.email}
              onClick={handleResend}
            >
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("verify_email_resend")}...
                </>
              ) : (
                t("verify_email_resend")
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={handleSignOut}
            >
              {t("back_to_sign_in")}
            </Button>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
