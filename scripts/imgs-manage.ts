/**
 * imgs-manage.ts
 *
 * Processes raw images in the `imgs/` directory:
 *  1. Strips ALL metadata (EXIF, GPS, ICC profile, etc.)
 *  2. Compresses
 *  3. Outputs to `public/imgs/` with the same filename
 *  4. Deletes the raw original
 *
 * Run: npm run imgs
 * Also runs automatically via pre-commit hook.
 */

import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import { basename, join } from 'pathe'
import sharp from 'sharp'
import { compressSharp } from './img-compress'

const imgsDir = fileURLToPath(new URL('../imgs', import.meta.url))
const publicImgsDir = fileURLToPath(new URL('../public/imgs', import.meta.url))

await fs.mkdir(publicImgsDir, { recursive: true })

const rawFiles = await fg('**/*.{jpg,jpeg,png,webp}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: imgsDir,
})

if (!rawFiles.length) {
  console.log('No new images to process.')
  process.exit(0)
}

for (const filepath of rawFiles) {
  const name = basename(filepath)
  console.log(`Processing: ${name}`)

  const buffer = await fs.readFile(filepath)
  const img = sharp(buffer)
  const outPath = join(publicImgsDir, name)

  const { outBuffer } = await compressSharp(img, buffer, filepath, outPath)
  await fs.writeFile(outPath, outBuffer)
  await fs.unlink(filepath)

  console.log(`  ✓ → public/imgs/${name}`)
}

console.log(`\nProcessed ${rawFiles.length} image(s) → public/imgs/`)
