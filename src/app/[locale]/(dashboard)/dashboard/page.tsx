"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useDashboardStats,
  useDashboardStatsViewModel,
  useTodayAppointments,
} from "@/hooks/use-dashboard-stats";

const STAT_ICONS = {
  today_appointments: Calendar,
  active_patients: Users,
  monthly_revenue: DollarSign,
  outstanding: AlertCircle,
} as const;

const STAT_COLORS = {
  today_appointments: {
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  active_patients: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  monthly_revenue: {
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
  outstanding: {
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
} as const;

const STATUS_COLORS: Record<string, string> = {
  confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  scheduled:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  completed:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

function formatAppointmentTime(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return format(date, "hh:mm a");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardPage() {
  const t = useTranslations("reports");
  const tAppointments = useTranslations("appointments");
  const tTreatments = useTranslations("treatments");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: todayAppointments = [], isLoading: appointmentsLoading } =
    useTodayAppointments();
  const statCards = useDashboardStatsViewModel(stats);

  const treatmentItems = [
    {
      key: "completed" as const,
      label: tTreatments("completed"),
      value: stats?.treatmentProgress.completed ?? 0,
      color: "bg-emerald-500",
    },
    {
      key: "in_progress" as const,
      label: tTreatments("in_progress"),
      value: stats?.treatmentProgress.in_progress ?? 0,
      color: "bg-blue-500",
    },
    {
      key: "planned" as const,
      label: tTreatments("planned"),
      value: stats?.treatmentProgress.planned ?? 0,
      color: "bg-amber-500",
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("this_month")}</p>
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
            onClick={() => router.push(`/${locale}/appointments`)}
          >
            <CalendarPlus className="size-4" />
            {locale === "en" ? "New Appointment" : "موعد جديد"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = STAT_ICONS[stat.key];
          const colors = STAT_COLORS[stat.key];

          return (
            <Card key={stat.key} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">
                  {t(stat.key)}
                </CardDescription>
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  <Icon className={`size-4 ${colors.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
            {appointmentsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  {tAppointments("no_appointments")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => {
                  const patientName = apt.patients?.full_name ?? tc("labels.name");
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Avatar size="sm">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(patientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {patientName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatAppointmentTime(apt.start_time)}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 text-[10px] ${STATUS_COLORS[apt.status] ?? ""}`}
                        >
                          {tAppointments(`statuses.${apt.status}` as "statuses.confirmed")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
                  onClick={() => router.push(`/${locale}/appointments`)}
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
              {(stats?.treatmentProgress.completed ?? 0) === 0 &&
              (stats?.treatmentProgress.in_progress ?? 0) === 0 &&
              (stats?.treatmentProgress.planned ?? 0) === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    {tc("messages.no_data")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {treatmentItems.map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
