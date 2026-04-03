<template>
  <div class="wrap-demo">
    <h2 class="title">Pretext · 文字绕图演示</h2>
    <p class="subtitle">用 <code>layoutNextLine()</code> 实现杂志式文字绕排，渲染到 Canvas</p>

    <div class="controls">
      <label>
        图片宽度
        <input type="range" v-model.number="imgW" min="80" max="300" step="10" />
        <span>{{ imgW }}px</span>
      </label>
      <label>
        图片高度
        <input type="range" v-model.number="imgH" min="60" max="300" step="10" />
        <span>{{ imgH }}px</span>
      </label>
      <label>
        字号
        <input type="range" v-model.number="fontSize" min="12" max="24" step="1" />
        <span>{{ fontSize }}px</span>
      </label>
      <label>
        行高
        <input type="range" v-model.number="lineHeight" min="16" max="40" step="2" />
        <span>{{ lineHeight }}px</span>
      </label>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" />
    </div>

    <p class="note">← 拖动滑块实时更新排版</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

const canvasRef = ref(null)
const imgW = ref(160)
const imgH = ref(130)
const fontSize = ref(15)
const lineHeight = ref(24)

const PADDING = 24
const GAP = 12 // 图文间距

const SAMPLE_TEXT = `李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。床前明月光，疑是地上霜。举头望明月，低头思故乡。故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。两岸猿声啼不住，轻舟已过万重山。朝辞白帝彩云间，千里江陵一日还。大漠孤烟直，长河落日圆。萧关逢候骑，都护在燕然。渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。`

let img = null

function loadImage() {
  return new Promise(resolve => {
    const i = new Image()
    // 用 picsum 随机图，也可换成自己的图片 URL
    i.crossOrigin = 'anonymous'
    i.src = 'https://picsum.photos/seed/pretext/400/300'
    i.onload = () => { img = i; resolve() }
    i.onerror = () => { img = null; resolve() } // 加载失败也继续
  })
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const font = `${fontSize.value}px serif`
  const lh = lineHeight.value
  const iw = imgW.value
  const ih = imgH.value

  // 准备文本（每次字体变化需要重新 prepare）
  const prepared = prepareWithSegments(SAMPLE_TEXT, font)

  // Canvas 宽度 = 容器宽度
  const containerW = canvas.parentElement.clientWidth - PADDING * 2
  canvas.width = containerW + PADDING * 2

  // 逐行排版，计算总高度
  const lines = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = PADDING

  while (true) {
    // 图片区域内，行宽缩短
    const inImageZone = y < PADDING + ih
    const maxW = inImageZone
      ? containerW - iw - GAP
      : containerW

    // 图片区域内文字从右侧开始
    const x = inImageZone ? PADDING + iw + GAP : PADDING

    const line = layoutNextLine(prepared, cursor, maxW)
    if (line === null) break

    lines.push({ text: line.text, x, y })
    cursor = line.end
    y += lh
  }

  const totalHeight = Math.max(y + PADDING, PADDING + ih + PADDING)
  canvas.height = totalHeight

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 背景
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg') || '#faf9f6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 画图片
  if (img) {
    // 圆角裁剪
    ctx.save()
    roundRect(ctx, PADDING, PADDING, iw, ih, 8)
    ctx.clip()
    ctx.drawImage(img, PADDING, PADDING, iw, ih)
    ctx.restore()
    // 图片边框
    ctx.strokeStyle = '#d4c9b0'
    ctx.lineWidth = 1
    roundRect(ctx, PADDING, PADDING, iw, ih, 8)
    ctx.stroke()
  } else {
    // 占位框
    ctx.fillStyle = '#e8e3d8'
    roundRect(ctx, PADDING, PADDING, iw, ih, 8)
    ctx.fill()
    ctx.fillStyle = '#a09880'
    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.fillText('图片加载中…', PADDING + iw / 2, PADDING + ih / 2)
    ctx.textAlign = 'left'
  }

  // 画文字
  ctx.fillStyle = '#2c2416'
  ctx.font = font
  ctx.textBaseline = 'top'
  for (const line of lines) {
    ctx.fillText(line.text, line.x, line.y)
  }

  // 标注线（可选，展示图片边界）
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = '#c8bfa8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING, PADDING + ih)
  ctx.lineTo(canvas.width - PADDING, PADDING + ih)
  ctx.stroke()
  ctx.setLineDash([])
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

onMounted(async () => {
  await loadImage()
  await nextTick()
  draw()
})

watch([imgW, imgH, fontSize, lineHeight], () => {
  draw()
})
</script>

<style scoped>
.wrap-demo {
  font-family: 'Georgia', serif;
  max-width: 780px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #2c2416;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #7a6e5a;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

code {
  background: #f0ece3;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85em;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  background: #f5f1e8;
  border: 1px solid #e0d9cb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #5a5040;
}

.controls input[type="range"] {
  width: 110px;
  accent-color: #8b6f47;
}

.controls span {
  min-width: 40px;
  font-variant-numeric: tabular-nums;
  color: #8b6f47;
  font-weight: 600;
}

.canvas-wrapper {
  border: 1px solid #e0d9cb;
  border-radius: 10px;
  overflow: hidden;
  background: #faf9f6;
}

canvas {
  display: block;
  width: 100%;
}

.note {
  font-size: 0.8rem;
  color: #a09880;
  margin-top: 0.75rem;
  text-align: center;
}
</style>1