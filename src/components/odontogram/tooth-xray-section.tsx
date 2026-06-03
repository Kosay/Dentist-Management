'use client'

import { useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePatientImages, useUploadImage } from '@/hooks/use-images'
import { ImageLightbox } from '@/components/images/image-lightbox'
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/image-upload-limits'

const XRAY_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

interface ToothXraySectionProps {
  patientId: string
  toothNumber: number
  readOnly?: boolean
}

export function ToothXraySection({
  patientId,
  toothNumber,
  readOnly = false,
}: ToothXraySectionProps) {
  const t = useTranslations('odontogram')
  const tc = useTranslations('common')
  const ti = useTranslations('images')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadImage()
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const { data: allImages = [], isLoading } = usePatientImages(patientId, 'xray')

  const toothImages = useMemo(
    () => allImages.filter((img) => img.tooth_number === toothNumber),
    [allImages, toothNumber]
  )

  const hasOtherXrays =
    !isLoading && allImages.length > 0 && toothImages.length === 0

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(t('xray_size_limit'))
      e.target.value = ''
      return
    }

    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      toast.error(t('xray_invalid_type'))
      e.target.value = ''
      return
    }

    try {
      await uploadMutation.mutateAsync({
        file,
        patientId,
        category: 'xray',
        toothNumber,
        description: `${t('xray_for_tooth')} ${toothNumber}`,
      })
      toast.success(tc('messages.save_success'))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : tc('messages.save_error')
      toast.error(message)
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>{t('xray_images')}</Label>
        {!readOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {t('upload_xray')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={XRAY_ACCEPT}
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('xray_size_hint')}</p>

      {isLoading ? (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : toothImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center">
          <ImageIcon className="size-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">{t('no_xray_images')}</p>
          {hasOtherXrays && (
            <p className="text-[11px] text-muted-foreground/80">
              {t('xray_other_teeth_hint')}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {toothImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30"
              onClick={() => {
                setLightboxIndex(index)
                setLightboxOpen(true)
              }}
            >
              <img
                src={image.file_url}
                alt={image.description || image.file_name}
                className="size-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                {new Date(image.created_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {ti('panoramic')}: {ti('panoramic_tab_hint')}
      </p>

      <ImageLightbox
        images={toothImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
      />
    </div>
  )
}
