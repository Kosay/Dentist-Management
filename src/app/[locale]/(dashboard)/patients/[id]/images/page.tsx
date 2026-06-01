'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ImageGallery } from '@/components/images/image-gallery'
import { ImageUpload } from '@/components/images/image-upload'
import { BeforeAfterCompare } from '@/components/images/before-after-compare'
import { usePatientImages, useDeleteImage } from '@/hooks/use-images'
import type { ImageCategory } from '@/types/database'

type TabValue = 'all' | ImageCategory | 'compare'

export default function ImagesPage() {
  const params = useParams()
  const patientId = params.id as string
  const t = useTranslations('images')

  const { data: allImages = [], isLoading } = usePatientImages(patientId)
  const deleteMutation = useDeleteImage()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  const filteredImages = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'compare') return allImages
    return allImages.filter((img) => img.category === activeTab)
  }, [allImages, activeTab])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allImages.length }
    allImages.forEach((img) => {
      counts[img.category] = (counts[img.category] || 0) + 1
    })
    return counts
  }, [allImages])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`${allImages.length} ${t('title').toLowerCase()}`}
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-1.5 size-4" />
            {t('upload')}
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabValue)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All{' '}
            {categoryCounts.all > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({categoryCounts.all})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="before_treatment">
            {t('before_treatment')}
            {categoryCounts.before_treatment > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({categoryCounts.before_treatment})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="after_treatment">
            {t('after_treatment')}
            {categoryCounts.after_treatment > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({categoryCounts.after_treatment})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="clinical_photo">
            {t('clinical_photo')}
            {categoryCounts.clinical_photo > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({categoryCounts.clinical_photo})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="xray">
            {t('xray')}
            {categoryCounts.xray > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({categoryCounts.xray})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compare">{t('compare')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ImageGallery
            images={filteredImages}
            onDelete={(img) => deleteMutation.mutate(img)}
          />
        </TabsContent>
        <TabsContent value="before_treatment">
          <ImageGallery
            images={filteredImages}
            onDelete={(img) => deleteMutation.mutate(img)}
          />
        </TabsContent>
        <TabsContent value="after_treatment">
          <ImageGallery
            images={filteredImages}
            onDelete={(img) => deleteMutation.mutate(img)}
          />
        </TabsContent>
        <TabsContent value="clinical_photo">
          <ImageGallery
            images={filteredImages}
            onDelete={(img) => deleteMutation.mutate(img)}
          />
        </TabsContent>
        <TabsContent value="xray">
          <ImageGallery
            images={filteredImages}
            onDelete={(img) => deleteMutation.mutate(img)}
          />
        </TabsContent>
        <TabsContent value="compare">
          <BeforeAfterCompare patientId={patientId} />
        </TabsContent>
      </Tabs>

      <ImageUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        patientId={patientId}
      />
    </div>
  )
}
