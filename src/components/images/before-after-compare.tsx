'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { usePatientImages } from '@/hooks/use-images'
import { ImageIcon, ArrowLeftRight } from 'lucide-react'

interface BeforeAfterCompareProps {
  patientId: string
  toothNumber?: number
}

export function BeforeAfterCompare({
  patientId,
  toothNumber: initialTooth,
}: BeforeAfterCompareProps) {
  const t = useTranslations('images')
  const { data: beforeImages = [] } = usePatientImages(
    patientId,
    'before_treatment'
  )
  const { data: afterImages = [] } = usePatientImages(
    patientId,
    'after_treatment'
  )

  const [toothFilter, setToothFilter] = useState<string>(
    initialTooth?.toString() ?? 'all'
  )
  const [sliderPosition, setSliderPosition] = useState(50)
  const [selectedBefore, setSelectedBefore] = useState<string>('')
  const [selectedAfter, setSelectedAfter] = useState<string>('')
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const filteredBefore = useMemo(() => {
    if (toothFilter === 'all') return beforeImages
    return beforeImages.filter(
      (img) => img.tooth_number === Number(toothFilter)
    )
  }, [beforeImages, toothFilter])

  const filteredAfter = useMemo(() => {
    if (toothFilter === 'all') return afterImages
    return afterImages.filter(
      (img) => img.tooth_number === Number(toothFilter)
    )
  }, [afterImages, toothFilter])

  const beforeImage = filteredBefore.find((img) => img.id === selectedBefore) ??
    filteredBefore[0]
  const afterImage = filteredAfter.find((img) => img.id === selectedAfter) ??
    filteredAfter[0]

  const allTeeth = useMemo(() => {
    const teeth = new Set<number>()
    ;[...beforeImages, ...afterImages].forEach((img) => {
      if (img.tooth_number) teeth.add(img.tooth_number)
    })
    return Array.from(teeth).sort((a, b) => a - b)
  }, [beforeImages, afterImages])

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      setSliderPosition((x / rect.width) * 100)
      setContainerWidth(rect.width)
    },
    []
  )

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return
      updateSlider(e.clientX)
    },
    [updateSlider]
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updateSlider(e.touches[0].clientX)
    },
    [updateSlider]
  )

  const hasImages = beforeImage && afterImage

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowLeftRight className="size-4" />
            {t('compare')}
          </CardTitle>
          <div className="flex items-center gap-3">
            {allTeeth.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs">Tooth</Label>
                <Select value={toothFilter} onValueChange={(val) => setToothFilter(val ?? 'all')}>
                  <SelectTrigger className="h-7 w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {allTeeth.map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        #{n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasImages ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <ImageIcon className="size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('no_images')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Upload before and after treatment images to compare
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">{t('before_treatment')}</Label>
                {filteredBefore.length > 1 && (
                  <Select
                    value={selectedBefore || filteredBefore[0]?.id}
                    onValueChange={(val) => setSelectedBefore(val ?? '')}
                  >
                    <SelectTrigger className="h-7 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBefore.map((img) => (
                        <SelectItem key={img.id} value={img.id}>
                          {img.description ||
                            new Date(img.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('after_treatment')}</Label>
                {filteredAfter.length > 1 && (
                  <Select
                    value={selectedAfter || filteredAfter[0]?.id}
                    onValueChange={(val) => setSelectedAfter(val ?? '')}
                  >
                    <SelectTrigger className="h-7 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAfter.map((img) => (
                        <SelectItem key={img.id} value={img.id}>
                          {img.description ||
                            new Date(img.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div
              ref={containerRef}
              className="relative aspect-video cursor-col-resize select-none overflow-hidden rounded-lg border bg-muted"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onClick={(e) => updateSlider(e.clientX)}
            >
              <img
                src={afterImage.file_url}
                alt={t('after_treatment')}
                className="absolute inset-0 size-full object-contain"
                draggable={false}
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={beforeImage.file_url}
                  alt={t('before_treatment')}
                  className="absolute inset-0 size-full object-contain"
                  style={{
                    width: containerWidth > 0
                      ? `${containerWidth}px`
                      : '100%',
                  }}
                  draggable={false}
                />
              </div>

              <div
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/50 shadow-lg">
                  <ArrowLeftRight className="size-4 text-white" />
                </div>
              </div>

              <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                {t('before_treatment')}
              </div>
              <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                {t('after_treatment')}
              </div>
            </div>

            {(beforeImage.description || afterImage.description) && (
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <p>{beforeImage.description}</p>
                <p>{afterImage.description}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
