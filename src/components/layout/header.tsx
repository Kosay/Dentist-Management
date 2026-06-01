"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, LogOut, Settings, User } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const tc = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ms-2" />
      <Separator orientation="vertical" className="mx-2 !h-5" />

      {children ?? (
        <h1 className="text-sm font-semibold">{title}</h1>
      )}

      <div className="ms-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground">
          <Bell className="size-4" />
          <span className="absolute -top-0.5 -end-0.5 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="rounded-full" />}>
            <Avatar size="sm">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name ?? tc("labels.user")}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
              <User className="size-4" />
              {tNav("settings")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
              <Settings className="size-4" />
              {tNav("notifications")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4" />
              {tAuth("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
