'use client'

import { useCallback, useState } from 'react'
import type { ToothCondition, ToothSurface } from '@/types/database'
import {
  CONDITION_COLORS,
  getConditionRingColor,
  isMissingLikeCondition,
  type SurfaceCondition,
} from './tooth-data'

interface ToothSvgProps {
  toothNumber: number
  displayLabel: string
  surfaces: SurfaceCondition[]
  onSurfaceClick?: (surface: ToothSurface) => void
  isSelected?: boolean
  condition: ToothCondition
  treatmentCode?: string
  size?: number
  isUpper?: boolean
  readOnly?: boolean
}

function getSurfaceColor(condition: ToothCondition): string {
  if (condition === 'healthy') return '#FFFFFF'
  if (isMissingLikeCondition(condition)) return '#F3F4F6'
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
  displayLabel,
  surfaces,
  onSurfaceClick,
  isSelected = false,
  condition,
  treatmentCode,
  size = 50,
  isUpper = true,
  readOnly = false,
}: ToothSvgProps) {
  const [hoveredSurface, setHoveredSurface] = useState<ToothSurface | null>(null)
  const isMissingLike = isMissingLikeCondition(condition)
  const ringColor = isSelected ? '#2563EB' : getConditionRingColor(condition)

  const handleSurfaceClick = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isMissingLike) return
      onSurfaceClick?.(surface)
    },
    [readOnly, isMissingLike, onSurfaceClick]
  )

  const handleMouseEnter = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isMissingLike) return
      setHoveredSurface(surface)
    },
    [readOnly, isMissingLike]
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

  const overallFill =
    condition === 'healthy'
      ? '#FFFFFF'
      : isMissingLike
        ? '#F3F4F6'
        : CONDITION_COLORS[condition]

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {!isUpper && (
        <span
          className="text-[10px] font-medium tabular-nums text-muted-foreground leading-none"
          style={{ height: labelHeight, lineHeight: `${labelHeight}px` }}
        >
          {displayLabel}
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
          fill={overallFill}
          stroke={ringColor ?? 'transparent'}
          strokeWidth={ringColor ? 2 : 0}
          strokeDasharray={condition === 'denture_planned' ? '3 2' : undefined}
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
                fill={isMissingLike ? '#F3F4F6' : getSurfaceColor(cond)}
                stroke={isMissingLike ? '#D1D5DB' : getSurfaceBorder(cond)}
                strokeWidth={1}
                opacity={isHovered && !isMissingLike ? 0.75 : 1}
                className="transition-all duration-150"
                onClick={() => handleSurfaceClick(surface)}
                onMouseEnter={() => handleMouseEnter(surface)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}

        {condition === 'missing' && (
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

        {condition === 'implant_planned' && (
          <>
            <circle
              cx={center}
              cy={center}
              r={halfOuter * 0.35}
              fill="none"
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
            />
            <line
              x1={center}
              y1={center - halfOuter * 0.35}
              x2={center}
              y2={center + halfOuter * 0.35}
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
            />
            <line
              x1={center - halfOuter * 0.35}
              y1={center}
              x2={center + halfOuter * 0.35}
              y2={center}
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
            />
          </>
        )}

        {condition === 'denture_planned' && (
          <text
            x={center}
            y={center + 3}
            textAnchor="middle"
            fontSize={size * 0.28}
            fontWeight="700"
            fill={CONDITION_COLORS.denture_planned}
          >
            D
          </text>
        )}

        {treatmentCode && (
          <text
            x={margin + 2}
            y={margin + size * 0.22}
            fontSize={size * 0.22}
            fontWeight="700"
            fill="#1F2937"
          >
            {treatmentCode}
          </text>
        )}
      </svg>
      {isUpper && (
        <span
          className="text-[10px] font-medium tabular-nums text-muted-foreground leading-none"
          style={{ height: labelHeight, lineHeight: `${labelHeight}px` }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  )
}
