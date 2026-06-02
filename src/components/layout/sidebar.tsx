"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Languages,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "patients", href: "/patients", icon: Users },
  { key: "appointments", href: "/appointments", icon: Calendar },
  { key: "billing", href: "/billing", icon: CreditCard },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

const ADMIN_ITEM = {
  key: "admin",
  href: "/admin",
  icon: Shield,
} as const;

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const tc = useTranslations("common");
  const tRoles = useTranslations("settings.roles");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { profile, clinic, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/login`);
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DC";

  const clinicName =
    locale === "ar" && clinic?.name_ar ? clinic.name_ar : clinic?.name ?? tAuth("brand_title");

  const roleLabel = profile?.role ? tRoles(profile.role) : "";

  return (
    <Sidebar
      key={locale}
      side={locale === "ar" ? "right" : "left"}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            {clinicName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="max-w-[140px] truncate text-sm font-semibold text-sidebar-foreground">
              {clinicName}
            </span>
            <span className="text-xs text-sidebar-foreground/60">{roleLabel}</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={t(item.key)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{t(item.key)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {profile?.role === "super_admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive(ADMIN_ITEM.href)}
                    tooltip={t(ADMIN_ITEM.key)}
                    render={<Link href={ADMIN_ITEM.href} />}
                  >
                    <ADMIN_ITEM.icon className="size-4" />
                    <span>{t(ADMIN_ITEM.key)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        <div className="px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <Languages className="size-4" />
            {locale === "en" ? "العربية" : "English"}
          </Button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" className="w-full" />}
              >
                <Avatar size="sm">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  )}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-start text-sm leading-tight">
                  <span className="truncate font-medium">
                    {profile?.full_name ?? tc("labels.user")}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {profile?.email ?? ""}
                  </span>
                </div>
                <ChevronUp className="ms-auto size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
                  <Settings className="size-4" />
                  {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  {tAuth("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
