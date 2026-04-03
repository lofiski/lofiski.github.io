/**
 * photos-manage.ts
 *
 * Processes raw photos in the `photos/` directory:
 *  1. Reads EXIF to extract the earliest possible capture date
 *  2. Strips ALL metadata (EXIF, GPS, ICC profile, etc.) from output
 *  3. Compresses the image
 *  4. Renames to `p-{iso-date}-{index}.{ext}` (safe, no original filename)
 *  5. Sets file mtime to capture date (prevents git from leaking processing time)
 *  6. Generates blurhash sidecar .json files
 *  7. Updates src/data/photos.json manifest used by the Vue app
 *
 * Run: npm run photos
 */

import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { encode as blurhashEncode } from 'blurhash'
import ExifReader from 'exifreader'
import fg from 'fast-glob'
import { basename, join, parse } from 'pathe'
import sharp from 'sharp'
import { compressSharp } from './img-compress'

const photosDir = fileURLToPath(new URL('../photos', import.meta.url))
const publicPhotosDir = fileURLToPath(new URL('../public/photos', import.meta.url))
const manifestPath = fileURLToPath(new URL('../src/data/photos.json', import.meta.url))

// Ensure output dirs exist
await fs.mkdir(publicPhotosDir, { recursive: true })

// ── Step 1: Process raw (non-p-) photos ──────────────────────────────────────

const rawFiles = await fg('**/*.{jpg,png,jpeg,webp}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: photosDir,
}).then(files => files.filter(f => !basename(f).startsWith('p-')))

for (const filepath of rawFiles) {
  console.log(`Processing: ${basename(filepath)}`)

  const buffer = await fs.readFile(filepath)
  const img = sharp(buffer)
  const meta = await img.metadata()

  // ── Extract capture date (earliest available) ──────────────────────────────
  let captureDate: Date | null = null

  try {
    const exif = await ExifReader.load(buffer)

    // Try sources in priority order: original capture > file date > IPTC date
    const candidates: string[] = []

    const dateOriginal = exif.DateTimeOriginal?.description
    const dateTime = exif.DateTime?.description
    const dateCreated = exif['Date Created']?.description ?? exif.DateCreated?.description

    if (dateOriginal) candidates.push(dateOriginal)
    if (dateTime) candidates.push(dateTime)
    if (dateCreated) candidates.push(dateCreated)

    // Parse "YYYY:MM:DD HH:MM:SS" format (EXIF standard)
    for (const raw of candidates) {
      const normalized = String(raw).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
      const d = new Date(normalized)
      if (!Number.isNaN(d.getTime())) {
        captureDate = d
        break
      }
    }
  }
  catch {
    // ExifReader failed — fall through to filesystem timestamps
  }

  if (!captureDate) {
    // Fall back to filesystem: take the earlier of birthtime / mtime
    const stat = await fs.stat(filepath)
    const birthtime = stat.birthtime.getTime() || Infinity
    const mtime = stat.mtime.getTime()
    captureDate = new Date(Math.min(birthtime, mtime))
  }

  // Sanity check: reject dates that are suspiciously recent (< 1 hour ago)
  if (Date.now() - captureDate.getTime() < 1000 * 60 * 60) {
    console.warn(`  ⚠ Capture date too recent for ${basename(filepath)}, skipping.`)
    continue
  }

  // ── Build output filename: p-{iso}-{index}.{ext} ──────────────────────────
  const isoStr = captureDate
    .toISOString()
    .replace(/[:.]/g, '-')    // 2024-03-15T10-30-00-000Z
    .replace('T', 't')
    .replace('Z', 'z')
    .replace(/z$/, '')        // drop trailing z for readability

  let { ext } = parse(filepath.toLowerCase())
  if (ext === '.jpeg') ext = '.jpg'

  let index = 1
  while (existsSync(join(publicPhotosDir, `p-${isoStr}-${index}${ext}`)))
    index++

  const outFilename = `p-${isoStr}-${index}${ext}`
  const outPath = join(publicPhotosDir, outFilename)

  // ── Compress + strip metadata ─────────────────────────────────────────────
  const { outBuffer } = await compressSharp(img, buffer, filepath, outPath)
  await fs.writeFile(outPath, outBuffer)

  // Set mtime of output file to capture date (hide processing timestamp)
  await fs.utimes(outPath, captureDate, captureDate)

  // ── Write minimal sidecar JSON (date, dimensions) ─────────────────────────
  const outMeta = await sharp(outBuffer).metadata()
  const sidecar: Record<string, unknown> = {
    date: captureDate.toISOString(),
    width: outMeta.width ?? meta.width,
    height: outMeta.height ?? meta.height,
  }
  await fs.writeFile(
    join(publicPhotosDir, outFilename.replace(/\.\w+$/, '.json')),
    JSON.stringify(sidecar, null, 2),
  )

  // ── Delete original (raw file — has EXIF, potentially GPS) ───────────────
  await fs.unlink(filepath)
  console.log(`  ✓ → public/photos/${outFilename}`)
}

// ── Step 2: Generate / update blurhash for processed photos ──────────────────

const processedFiles = await fg('p-*.{jpg,png,jpeg,webp}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: publicPhotosDir,
})

for (const filepath of processedFiles) {
  const jsonPath = filepath.replace(/\.\w+$/, '.json')
  let sidecar: Record<string, unknown> = {}

  if (existsSync(jsonPath)) {
    sidecar = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))
  }

  if (sidecar.blurhash) continue // already computed

  const buffer = await fs.readFile(filepath)
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'cover' })
    .toBuffer({ resolveWithObject: true })

  sidecar.blurhash = blurhashEncode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4,
  )
  await fs.writeFile(jsonPath, JSON.stringify(sidecar, null, 2))
  console.log(`  ✓ blurhash: ${basename(filepath)}`)
}

// ── Step 3: Clean up orphaned JSON files ──────────────────────────────────────

const allJsonFiles = await fg('p-*.json', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: publicPhotosDir,
})

for (const jsonPath of allJsonFiles) {
  const base = jsonPath.replace(/\.json$/, '')
  const hasImage = ['.jpg', '.jpeg', '.png', '.webp'].some(e => existsSync(base + e))
  if (!hasImage) {
    await fs.unlink(jsonPath)
    console.log(`  ✓ Removed orphaned JSON: ${basename(jsonPath)}`)
  }
}

// ── Step 4: Rebuild src/data/photos.json manifest ────────────────────────────

const finalJsonFiles = await fg('p-*.json', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: publicPhotosDir,
}).then(files => files.sort((a, b) => a.localeCompare(b)))

const photosList: Record<string, unknown>[] = []

for (const jsonPath of finalJsonFiles) {
  const sidecar: Record<string, unknown> = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))
  const filename = basename(jsonPath).replace(/\.json$/, '')
  // Find actual image extension
  const ext = ['.jpg', '.jpeg', '.png', '.webp'].find(e =>
    existsSync(join(publicPhotosDir, filename + e)),
  )
  if (!ext) continue

  photosList.push({
    filename: filename + ext,
    date: sidecar.date ?? '',
    blurhash: sidecar.blurhash ?? null,
    width: sidecar.width ?? null,
    height: sidecar.height ?? null,
    title: sidecar.title ?? null,
  })
}

await fs.writeFile(manifestPath, JSON.stringify({ photos: photosList }, null, 2))
console.log(`\nManifest updated: ${photosList.length} photos`)
