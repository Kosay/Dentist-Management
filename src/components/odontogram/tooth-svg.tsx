'use client'

import { useCallback, useState } from 'react'
import type { ToothCondition, ToothSurface } from '@/types/database'
import { CONDITION_COLORS, type SurfaceCondition } from './tooth-data'

interface ToothSvgProps {
  toothNumber: number
  surfaces: SurfaceCondition[]
  onSurfaceClick?: (surface: ToothSurface) => void
  isSelected?: boolean
  condition: ToothCondition
  size?: number
  isUpper?: boolean
  readOnly?: boolean
}

function getSurfaceColor(condition: ToothCondition): string {
  return CONDITION_COLORS[condition]
}

function getSurfaceBorder(condition: ToothCondition): string {
  if (condition === 'healthy') return '#D1D5DB'
  return CONDITION_COLORS[condition]
}

function findSurfaceCondition(
  surfaces: SurfaceCondition[],
  surface: ToothSurface
): ToothCondition {
  return surfaces.find((s) => s.surface === surface)?.condition ?? 'healthy'
}

export function ToothSvg({
  toothNumber,
  surfaces,
  onSurfaceClick,
  isSelected = false,
  condition,
  size = 50,
  isUpper = true,
  readOnly = false,
}: ToothSvgProps) {
  const [hoveredSurface, setHoveredSurface] = useState<ToothSurface | null>(null)
  const isMissing = condition === 'missing'

  const handleSurfaceClick = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isMissing) return
      onSurfaceClick?.(surface)
    },
    [readOnly, isMissing, onSurfaceClick]
  )

  const handleMouseEnter = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isMissing) return
      setHoveredSurface(surface)
    },
    [readOnly, isMissing]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredSurface(null)
  }, [])

  const margin = 4
  const svgSize = size + margin * 2
  const labelHeight = 16

  const outer = size
  const inner = size * 0.38
  const center = size / 2 + margin
  const halfOuter = outer / 2
  const halfInner = inner / 2

  const hasSurface = (s: ToothSurface) => surfaces.some((sc) => sc.surface === s)
  const centerSurface: ToothSurface = hasSurface('occlusal') ? 'occlusal' : 'incisal'

  const surfacePaths: { surface: ToothSurface; d: string }[] = [
    {
      surface: 'buccal',
      d: `M ${center - halfOuter} ${center - halfOuter}
          L ${center + halfOuter} ${center - halfOuter}
          L ${center + halfInner} ${center - halfInner}
          L ${center - halfInner} ${center - halfInner} Z`,
    },
    {
      surface: 'lingual',
      d: `M ${center - halfOuter} ${center + halfOuter}
          L ${center + halfOuter} ${center + halfOuter}
          L ${center + halfInner} ${center + halfInner}
          L ${center - halfInner} ${center + halfInner} Z`,
    },
    {
      surface: 'mesial',
      d: `M ${center - halfOuter} ${center - halfOuter}
          L ${center - halfOuter} ${center + halfOuter}
          L ${center - halfInner} ${center + halfInner}
          L ${center - halfInner} ${center - halfInner} Z`,
    },
    {
      surface: 'distal',
      d: `M ${center + halfOuter} ${center - halfOuter}
          L ${center + halfOuter} ${center + halfOuter}
          L ${center + halfInner} ${center + halfInner}
          L ${center + halfInner} ${center - halfInner} Z`,
    },
    {
      surface: centerSurface,
      d: `M ${center - halfInner} ${center - halfInner}
          L ${center + halfInner} ${center - halfInner}
          L ${center + halfInner} ${center + halfInner}
          L ${center - halfInner} ${center + halfInner} Z`,
    },
  ]

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {!isUpper && (
        <span
          className="text-[10px] font-medium tabular-nums text-muted-foreground leading-none"
          style={{ height: labelHeight, lineHeight: `${labelHeight}px` }}
        >
          {toothNumber}
        </span>
      )}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="shrink-0"
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
      >
        <rect
          x={margin}
          y={margin}
          width={outer}
          height={outer}
          rx={size * 0.15}
          ry={size * 0.15}
          fill="none"
          stroke={isSelected ? '#2563EB' : 'transparent'}
          strokeWidth={isSelected ? 2.5 : 0}
          className="transition-all duration-150"
        />

        {surfacePaths
          .filter(({ surface }) => hasSurface(surface))
          .map(({ surface, d }) => {
            const cond = findSurfaceCondition(surfaces, surface)
            const isHovered = hoveredSurface === surface
            return (
              <path
                key={surface}
                d={d}
                fill={isMissing ? '#F3F4F6' : getSurfaceColor(cond)}
                stroke={isMissing ? '#D1D5DB' : getSurfaceBorder(cond)}
                strokeWidth={1}
                opacity={isHovered && !isMissing ? 0.75 : 1}
                className="transition-all duration-150"
                onClick={() => handleSurfaceClick(surface)}
                onMouseEnter={() => handleMouseEnter(surface)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}

        {isMissing && (
          <>
            <line
              x1={center - halfOuter * 0.65}
              y1={center - halfOuter * 0.65}
              x2={center + halfOuter * 0.65}
              y2={center + halfOuter * 0.65}
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={center + halfOuter * 0.65}
              y1={center - halfOuter * 0.65}
              x2={center - halfOuter * 0.65}
              y2={center + halfOuter * 0.65}
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      {isUpper && (
        <span
          className="text-[10px] font-medium tabular-nums text-muted-foreground leading-none"
          style={{ height: labelHeight, lineHeight: `${labelHeight}px` }}
        >
          {toothNumber}
        </span>
      )}
    </div>
  )
}
