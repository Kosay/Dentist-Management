export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const MAX_IMAGE_SIZE_MB = 5

export function isWithinImageSizeLimit(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE_BYTES
}
