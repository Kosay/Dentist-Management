'use client'

import { useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUploadImage } from '@/hooks/use-images'
import { FdiToothSelect } from '@/components/odontogram/fdi-tooth-select'
import { useVisits } from '@/hooks/use-visits'
import { useTreatmentPlans } from '@/hooks/use-treatments'
import { getTreatmentTypeLabel } from '@/lib/treatment-types'
import {
  getMaxImageSizeMb,
  isAcceptedImageFile,
  isWithinImageSizeLimit,
} from '@/lib/image-upload-limits'
import { Upload, X, FileImage, Loader2 } from 'lucide-react'
import type { ImageCategory } from '@/types/database'
import { cn } from '@/lib/utils'

const CATEGORIES: { value: ImageCategory; labelKey: string }[] = [
  { value: 'before_treatment', labelKey: 'before_treatment' },
  { value: 'after_treatment', labelKey: 'after_treatment' },
  { value: 'clinical_photo', labelKey: 'clinical_photo' },
  { value: 'xray', labelKey: 'xray' },
  { value: 'panoramic', labelKey: 'panoramic' },
]

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

interface UploadFormValues {
  category: ImageCategory
  tooth_number?: number
  visit_id?: string
  treatment_plan_id?: string
  description?: string
}

interface ImageUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

export function ImageUpload({
  open,
  onOpenChange,
  patientId,
}: ImageUploadProps) {
  const t = useTranslations('images')
  const tt = useTranslations('treatments')
  const tc = useTranslations('common')
  const uploadMutation = useUploadImage()
  const { data: visits = [] } = useVisits(patientId)
  const { data: treatments = [] } = useTreatmentPlans(patientId)

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UploadFormValues>({
    defaultValues: {
      category: 'clinical_photo',
      description: '',
    },
  })

  const selectedCategory = form.watch('category')

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter((f) => {
      if (!isAcceptedImageFile(f) && !ACCEPTED_TYPES.includes(f.type)) {
        toast.error(t('supported_formats'))
        return false
      }
      if (!isWithinImageSizeLimit(f, selectedCategory)) {
        toast.error(
          t('size_limit_error', { max: getMaxImageSizeMb(selectedCategory) })
        )
        return false
      }
      return true
    })
    setFiles((prev) => [...prev, ...validFiles])

    validFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      } else {
        setPreviews((prev) => [...prev, ''])
      }
    })
  },
    [t, selectedCategory]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: UploadFormValues) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(5)
    const total = files.length

    try {
      for (let i = 0; i < total; i++) {
        setUploadProgress(Math.max(5, Math.round((i / total) * 100)))
        await uploadMutation.mutateAsync({
          file: files[i],
          patientId,
          category: values.category,
          description: values.description,
          toothNumber: values.tooth_number,
          visitId: values.visit_id || undefined,
          treatmentPlanId: values.treatment_plan_id || undefined,
        })
        setUploadProgress(Math.round(((i + 1) / total) * 100))
      }

      toast.success(tc('messages.save_success'))
      setFiles([])
      setPreviews([])
      form.reset()
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : tc('messages.save_error')
      toast.error(message)
    } finally {
      setUploadProgress(0)
      setIsUploading(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFiles([])
      setPreviews([])
      setUploadProgress(0)
      form.reset()
    }
    onOpenChange(isOpen)
  }

  const isPending = isUploading || uploadMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('upload')}</DialogTitle>
          <DialogDescription>{t('drag_drop')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <form
            id="image-upload-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-1"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('drag_drop')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {t('supported_formats')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files)
                }}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg border p-2"
                  >
                    {previews[index] ? (
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="size-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                        <FileImage className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('image_type')}</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {t(cat.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tc('labels.optional')} — Tooth #</Label>
                <Controller
                  control={form.control}
                  name="tooth_number"
                  render={({ field }) => (
                    <FdiToothSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="—"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>{tc('labels.optional')} — Visit</Label>
                <Controller
                  control={form.control}
                  name="visit_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {visits.map((visit) => (
                          <SelectItem key={visit.id} value={visit.id}>
                            {new Date(visit.visit_date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{tc('labels.optional')} — Treatment Plan</Label>
              <Controller
                control={form.control}
                name="treatment_plan_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map((tp) => (
                        <SelectItem key={tp.id} value={tp.id}>
                          {getTreatmentTypeLabel(
                            (key) => tt(key),
                            tp.treatment_type
                          )}
                          {tp.tooth_number ? ` (#${tp.tooth_number})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('image_notes')}</Label>
              <Textarea
                rows={2}
                placeholder={t('image_notes')}
                {...form.register('description')}
              />
            </div>

            {isPending && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tc('buttons.loading')}</span>
                  <span>{uploadProgress > 0 ? `${uploadProgress}%` : '…'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full bg-primary transition-all',
                      uploadProgress === 0 && 'w-1/3 animate-pulse'
                    )}
                    style={
                      uploadProgress > 0
                        ? { width: `${uploadProgress}%` }
                        : undefined
                    }
                  />
                </div>
              </div>
            )}
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button
            type="submit"
            form="image-upload-form"
            disabled={isPending || files.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                {tc('buttons.loading')}
              </>
            ) : (
              <>
                <Upload className="mr-1.5 size-4" />
                {tc('buttons.upload')} ({files.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
