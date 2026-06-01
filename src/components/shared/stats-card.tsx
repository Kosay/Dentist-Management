import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: StatsCardProps) {
  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend && (
              <>
                <TrendIcon
                  className={cn(
                    'size-3',
                    trend.direction === 'up' && 'text-emerald-500',
                    trend.direction === 'down' && 'text-red-500'
                  )}
                />
                <span
                  className={cn(
                    trend.direction === 'up' && 'text-emerald-500',
                    trend.direction === 'down' && 'text-red-500'
                  )}
                >
                  {trend.percentage}%
                </span>
              </>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
