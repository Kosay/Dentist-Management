'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ImageLightbox } from '@/components/images/image-lightbox'
import { Trash2, ImageIcon } from 'lucide-react'
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
  panoramic:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
}

interface ImageGalleryProps {
  images: Tables<'patient_images'>[]
  onDelete?: (image: Tables<'patient_images'>) => void
}

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const t = useTranslations('images')
  const tc = useTranslations('common')

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Tables<'patient_images'> | null>(
    null
  )

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setLightboxOpen(true)
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <ImageIcon className="size-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">{t('no_images')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => openLightbox(index)}
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {image.mime_type?.startsWith('image/') ? (
                <img
                  src={image.file_url}
                  alt={image.description || image.file_name}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ImageIcon className="size-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon-xs"
                  className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(image)
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
            <CardContent className="p-3">
              <Badge
                className={cn(
                  'pointer-events-none mb-1.5 border-0',
                  CATEGORY_STYLES[image.category]
                )}
              >
                {t(image.category)}
              </Badge>
              {image.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {image.description}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ImageLightbox
        images={images}
        currentIndex={selectedIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setSelectedIndex}
      />

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          title={t('delete_image')}
          description={tc('messages.confirm_delete')}
          onConfirm={() => {
            onDelete?.(deleteTarget)
            setDeleteTarget(null)
          }}
          variant="destructive"
        />
      )}
    </>
  )
}
