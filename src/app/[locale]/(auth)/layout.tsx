"use client";

import { AuthLanguageSwitcher } from "@/components/auth/auth-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.12),transparent_55%)]" />

      <div className="absolute top-4 end-4 z-10">
        <AuthLanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
