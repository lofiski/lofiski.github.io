import type sharp from 'sharp'

export interface CompressResult {
  outBuffer: Buffer
  outFile: string
  percent: number
}

/**
 * Compress an image using sharp, stripping ALL metadata (EXIF, GPS, ICC, etc.)
 * Returns the compressed buffer and its output path.
 */
export async function compressSharp(
  img: ReturnType<typeof sharp>,
  originalBuffer: Buffer,
  inputPath: string,
  outputPath: string,
): Promise<CompressResult> {
  const lowerPath = outputPath.toLowerCase()
  const isJpeg = lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')
  const isPng = lowerPath.endsWith('.png')
  const isWebp = lowerPath.endsWith('.webp')

  let outBuffer: Buffer

  if (isJpeg) {
    outBuffer = await img
      .jpeg({ quality: 85, progressive: true })
      // withMetadata intentionally omitted → strips all EXIF/GPS
      .toBuffer()
  }
  else if (isPng) {
    outBuffer = await img
      .png({ compressionLevel: 8 })
      .toBuffer()
  }
  else if (isWebp) {
    outBuffer = await img
      .webp({ quality: 85 })
      .toBuffer()
  }
  else {
    // Fallback: re-encode as jpeg
    outBuffer = await img
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()
  }

  const percent = (outBuffer.length - originalBuffer.length) / originalBuffer.length

  return {
    outBuffer,
    outFile: outputPath,
    percent,
  }
}
