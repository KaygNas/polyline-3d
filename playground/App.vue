<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Dot, Polyline3DMeshBuilder, Polyline3DMeshRenderer } from '../src'

const dots = [
  // the outline of number 1
  [0.0, 0.0, 0.1, 0.1 * 5],
  [0.0, 1.0, 0.2, 0.2 * 5],
  [1.0, 1.0, 0.3, 0.3 * 5],
  [1.0, 6.0, 0.4, 0.4 * 5],
  [0.0, 6.0, 0.5, 0.5 * 5],
  [0.0, 7.0, 0.4, 0.4 * 5],
  [1.0, 8.0, 0.3, 0.3 * 5],
  [2.0, 8.0, 0.2, 0.2 * 5],
  [2.0, 1.0, 0.1, 0.1 * 5],
  [3.0, 1.0, 0.2, 0.2 * 5],
  [3.0, 0.0, 0.3, 0.3 * 5],
  [0.0, 0.0, 0.1, 0.1 * 5],
].map(Dot.fromValue)

const canvasEle = ref<HTMLCanvasElement>()
const main = async (canvasEle: HTMLCanvasElement) => {
  const builder = new Polyline3DMeshBuilder(dots, { smooth: true, interpolationCount: 20 })
  const renderer = new Polyline3DMeshRenderer(canvasEle)
  renderer.addMesh(builder.build())
  renderer.render()
}

onMounted(() => {
  main(canvasEle.value!)
})
</script>

<template>
  <canvas ref="canvasEle" :width="800" :height="800" />
</template>
