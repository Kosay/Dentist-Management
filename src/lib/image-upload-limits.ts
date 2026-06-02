import type { ImageCategory } from '@/types/database'

export const MAX_IMAGE_SIZE_MB = 5
export const MAX_PANORAMIC_SIZE_MB = 15

export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
export const MAX_PANORAMIC_SIZE_BYTES = MAX_PANORAMIC_SIZE_MB * 1024 * 1024

export function getMaxImageSizeBytes(category?: ImageCategory): number {
  if (category === 'panoramic') {
    return MAX_PANORAMIC_SIZE_BYTES
  }
  return MAX_IMAGE_SIZE_BYTES
}

export function getMaxImageSizeMb(category?: ImageCategory): number {
  if (category === 'panoramic') {
    return MAX_PANORAMIC_SIZE_MB
  }
  return MAX_IMAGE_SIZE_MB
}

export function isWithinImageSizeLimit(
  file: File,
  category?: ImageCategory
): boolean {
  return file.size <= getMaxImageSizeBytes(category)
}

export function isAcceptedImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)
}
