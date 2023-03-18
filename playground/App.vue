<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Dot, Polyline3DMeshBuilder, Polyline3DMeshRenderer } from '../src'

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
