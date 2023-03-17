<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Polyline3DMeshBuilder } from '../src/render/polyline-3d-mesh-builder'
import { Dot } from '../src/render/dot'
import { Polyline3DMeshRenderer } from '../src/render/polyline-3d-mesh-renderer'

const dots = [
  // the outline of number 1
  [0.0, 0.0, 0.1, 100],
  [0.0, 1.0, 0.2, 100],
  [1.0, 1.0, 0.3, 100],
  [1.0, 6.0, 0.4, 100],
  [0.0, 6.0, 0.5, 100],
  [0.0, 7.0, 0.4, 100],
  [1.0, 8.0, 0.3, 100],
  [2.0, 8.0, 0.2, 100],
  [2.0, 1.0, 0.1, 100],
  [3.0, 1.0, 0.2, 100],
  [3.0, 0.0, 0.3, 100],
  [0.0, 0.0, 0.1, 100],
].map(Dot.fromValue)

const canvasEle = ref<HTMLCanvasElement>()
const main = async (canvasEle: HTMLCanvasElement) => {
  const builder = new Polyline3DMeshBuilder(dots, { smooth: true })
  const renderer = new Polyline3DMeshRenderer(canvasEle)
  renderer.render(builder.build())
  console.log('renderer=', renderer)
}

onMounted(() => {
  main(canvasEle.value!)
})
</script>

<template>
  <canvas ref="canvasEle" :width="800" :height="800" />
</template>
