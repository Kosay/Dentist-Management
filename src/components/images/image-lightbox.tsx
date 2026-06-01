'use client'

import { useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  ImageIcon,
} from 'lucide-react'
import type { Tables, ImageCategory } from '@/types/database'
import { cn } from '@/lib/utils'

const CATEGORY_STYLES: Record<ImageCategory, string> = {
  before_treatment:
    'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  after_treatment:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  clinical_photo:
    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  xray: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
}

interface ImageLightboxProps {
  images: Tables<'patient_images'>[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}

export function ImageLightbox({
  images,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ImageLightboxProps) {
  const t = useTranslations('images')

  const currentImage = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(currentIndex + 1)
  }, [hasNext, currentIndex, onIndexChange])

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(currentIndex - 1)
  }, [hasPrev, currentIndex, onIndexChange])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, goNext, goPrev, onOpenChange])

  const handleDownload = () => {
    if (!currentImage) return
    const link = document.createElement('a')
    link.href = currentImage.file_url
    link.download = currentImage.file_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!currentImage) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 p-0 sm:max-w-4xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {currentImage.description || currentImage.file_name}
        </DialogTitle>

        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                'pointer-events-none border-0',
                CATEGORY_STYLES[currentImage.category]
              )}
            >
              {t(currentImage.category)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={handleDownload}>
              <Download className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/5 dark:bg-black/20">
          {hasPrev && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 z-10 rounded-full shadow-md"
              onClick={goPrev}
            >
              <ChevronLeft className="size-5" />
            </Button>
          )}

          {currentImage.mime_type?.startsWith('image/') ? (
            <img
              src={currentImage.file_url}
              alt={currentImage.description || currentImage.file_name}
              className="max-h-[60vh] max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="size-16 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {currentImage.file_name}
              </p>
            </div>
          )}

          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 z-10 rounded-full shadow-md"
              onClick={goNext}
            >
              <ChevronRight className="size-5" />
            </Button>
          )}
        </div>

        <div className="space-y-2 border-t px-4 py-3">
          {currentImage.description && (
            <p className="text-sm">{currentImage.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{currentImage.file_name}</span>
            {currentImage.file_size && (
              <span>{(currentImage.file_size / 1024).toFixed(1)} KB</span>
            )}
            {currentImage.tooth_number && (
              <span>Tooth #{currentImage.tooth_number}</span>
            )}
            <span>
              {new Date(currentImage.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
