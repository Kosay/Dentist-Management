"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  UserPlus,
  CalendarPlus,
  Clock,
  ArrowUpRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STATS = [
  {
    key: "today_appointments" as const,
    value: "12",
    change: "+2",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    key: "active_patients" as const,
    value: "1,284",
    change: "+18",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    key: "monthly_revenue" as const,
    value: "$24,580",
    change: "+12%",
    icon: DollarSign,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
  {
    key: "outstanding" as const,
    value: "$3,420",
    change: "-8%",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
];

const RECENT_APPOINTMENTS = [
  {
    id: 1,
    patient: "Sarah Johnson",
    initials: "SJ",
    time: "09:00 AM",
    type: "Root Canal",
    status: "confirmed",
  },
  {
    id: 2,
    patient: "Ahmed Al-Rashid",
    initials: "AA",
    time: "10:30 AM",
    type: "Cleaning",
    status: "scheduled",
  },
  {
    id: 3,
    patient: "Maria Garcia",
    initials: "MG",
    time: "11:00 AM",
    type: "Check-up",
    status: "confirmed",
  },
  {
    id: 4,
    patient: "John Williams",
    initials: "JW",
    time: "02:00 PM",
    type: "Crown Fitting",
    status: "scheduled",
  },
  {
    id: 5,
    patient: "Fatima Noor",
    initials: "FN",
    time: "03:30 PM",
    type: "Extraction",
    status: "confirmed",
  },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function DashboardPage() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("this_month")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push(`/${locale}/patients/new`)}
          >
            <UserPlus className="size-4" />
            {locale === "en" ? "New Patient" : "مريض جديد"}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => router.push(`/${locale}/appointments/new`)}
          >
            <CalendarPlus className="size-4" />
            {locale === "en" ? "New Appointment" : "موعد جديد"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-medium">
                {t(stat.key)}
              </CardDescription>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="me-1 size-3 text-emerald-500" />
                <span className="font-medium text-emerald-500">
                  {stat.change}
                </span>
                <span className="ms-1">{t("this_month")}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {t("today_appointments")}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Your schedule for today"
                  : "جدولك لهذا اليوم"}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/appointments`)}
              className="text-xs"
            >
              {locale === "en" ? "View all" : "عرض الكل"}
              <ArrowUpRight className="ms-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_APPOINTMENTS.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="text-xs font-medium">
                      {apt.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {apt.patient}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {apt.type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {apt.time}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[apt.status] ?? ""}`}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {locale === "en" ? "Quick Actions" : "إجراءات سريعة"}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Common tasks at your fingertips"
                  : "المهام الشائعة في متناول يدك"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push(`/${locale}/patients/new`)}
                >
                  <UserPlus className="size-5 text-blue-600" />
                  <span className="text-xs">
                    {locale === "en" ? "New Patient" : "مريض جديد"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push(`/${locale}/appointments/new`)}
                >
                  <CalendarPlus className="size-5 text-emerald-600" />
                  <span className="text-xs">
                    {locale === "en" ? "New Appointment" : "موعد جديد"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push(`/${locale}/billing`)}
                >
                  <DollarSign className="size-5 text-violet-600" />
                  <span className="text-xs">
                    {locale === "en" ? "New Invoice" : "فاتورة جديدة"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push(`/${locale}/patients`)}
                >
                  <Users className="size-5 text-amber-600" />
                  <span className="text-xs">
                    {locale === "en" ? "All Patients" : "كل المرضى"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("treatments_progress")}
              </CardTitle>
              <CardDescription>
                {locale === "en"
                  ? "Active treatment overview"
                  : "نظرة عامة على العلاجات النشطة"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: locale === "en" ? "Completed" : "مكتمل", value: 68, color: "bg-emerald-500" },
                  { label: locale === "en" ? "In Progress" : "قيد التنفيذ", value: 22, color: "bg-blue-500" },
                  { label: locale === "en" ? "Planned" : "مخطط", value: 10, color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
