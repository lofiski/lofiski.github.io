<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { decode } from 'blurhash'

/**
 * Paints a blurhash placeholder. The photo pipeline already computes these hashes,
 * but nothing ever decoded them — the canvas rendered blank.
 * A small buffer is enough: the canvas is scaled up and blurred by CSS.
 */
const props = defineProps<{ hash: string }>()

const RES = 32
const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  try {
    const pixels = decode(props.hash, RES, RES)
    const image = ctx.createImageData(RES, RES)
    image.data.set(pixels)
    ctx.putImageData(image, 0, 0)
  }
  catch {
    // Malformed hash — leave the canvas transparent, the plain background shows through
  }
})
</script>

<template>
  <canvas ref="canvas" :width="RES" :height="RES" aria-hidden="true" />
</template>
