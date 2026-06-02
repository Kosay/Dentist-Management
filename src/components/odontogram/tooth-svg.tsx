'use client'

import { useCallback, useState } from 'react'
import type { ToothCondition, ToothSurface } from '@/types/database'
import { CONDITION_COLORS, type SurfaceCondition } from './tooth-data'

interface ToothSvgProps {
  toothNumber: number
  displayLabel: string
  surfaces: SurfaceCondition[]
  onSurfaceClick?: (surface: ToothSurface) => void
  isSelected?: boolean
  condition: ToothCondition
  size?: number
  isUpper?: boolean
  readOnly?: boolean
  treatmentTypeCode?: string
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
  displayLabel,
  surfaces,
  onSurfaceClick,
  isSelected = false,
  condition,
  size = 50,
  isUpper = true,
  readOnly = false,
  treatmentTypeCode,
}: ToothSvgProps) {
  const [hoveredSurface, setHoveredSurface] = useState<ToothSurface | null>(null)
  const isMissing = condition === 'missing'
  const isImplantPlanned = condition === 'implant_planned'
  const isDenturePlanned = condition === 'denture_planned'
  const isSpecialMissing = isMissing || isImplantPlanned || isDenturePlanned

  const handleSurfaceClick = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isSpecialMissing) return
      onSurfaceClick?.(surface)
    },
    [readOnly, isSpecialMissing, onSurfaceClick]
  )

  const handleMouseEnter = useCallback(
    (surface: ToothSurface) => {
      if (readOnly || isSpecialMissing) return
      setHoveredSurface(surface)
    },
    [readOnly, isSpecialMissing]
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

  // Condition ring color for permanent border around tooth (not just on selection)
  const conditionRingColor = condition !== 'healthy' ? CONDITION_COLORS[condition] : 'transparent'
  const outerStroke = isSelected ? '#2563EB' : conditionRingColor
  const outerStrokeWidth = isSelected ? 2.5 : condition !== 'healthy' ? 1.5 : 0

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
        {/* Condition border ring */}
        <rect
          x={margin}
          y={margin}
          width={outer}
          height={outer}
          rx={size * 0.15}
          ry={size * 0.15}
          fill="none"
          stroke={outerStroke}
          strokeWidth={outerStrokeWidth}
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
                fill={isSpecialMissing ? '#F3F4F6' : getSurfaceColor(cond)}
                stroke={isSpecialMissing ? '#D1D5DB' : getSurfaceBorder(cond)}
                strokeWidth={1}
                opacity={isHovered && !isSpecialMissing ? 0.75 : 1}
                className="transition-all duration-150"
                onClick={() => handleSurfaceClick(surface)}
                onMouseEnter={() => handleMouseEnter(surface)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}

        {/* Missing: gray X */}
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

        {/* Implant planned: circle with cross (implant symbol) */}
        {isImplantPlanned && (
          <>
            <circle
              cx={center}
              cy={center}
              r={halfOuter * 0.55}
              fill="none"
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
            />
            <line
              x1={center}
              y1={center - halfOuter * 0.55}
              x2={center}
              y2={center + halfOuter * 0.55}
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <line
              x1={center - halfOuter * 0.55}
              y1={center}
              x2={center + halfOuter * 0.55}
              y2={center}
              stroke={CONDITION_COLORS.implant_planned}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        )}

        {/* Denture planned: dashed border + D letter */}
        {isDenturePlanned && (
          <>
            <rect
              x={margin + 3}
              y={margin + 3}
              width={outer - 6}
              height={outer - 6}
              rx={size * 0.1}
              fill="none"
              stroke={CONDITION_COLORS.denture_planned}
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
            <text
              x={center}
              y={center + size * 0.12}
              textAnchor="middle"
              fontSize={size * 0.35}
              fontWeight="bold"
              fill={CONDITION_COLORS.denture_planned}
            >
              D
            </text>
          </>
        )}

        {/* Treatment type code badge (Cr, Br, Im, RC, Ve, De) */}
        {treatmentTypeCode && !isSpecialMissing && (
          <text
            x={margin + 2}
            y={margin + size * 0.28}
            fontSize={size * 0.22}
            fontWeight="bold"
            fill="#374151"
          >
            {treatmentTypeCode}
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
