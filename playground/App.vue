<script lang="ts" setup>
import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { mat4, vec3 } from 'gl-matrix'
import { Dot, MouseTracker, Polyline3DMeshBuilder, Polyline3DMeshRenderer } from '../src'
import Board from './board.vue'

const dots = ref([
  // the outline of number 1
  [0.0, 0.0, 0.01, 0.01 * 5],
  [0.0, 0.1, 0.02, 0.02 * 5],
  [0.1, 0.1, 0.03, 0.03 * 5],
  [0.1, 0.6, 0.04, 0.04 * 5],
  [0.0, 0.6, 0.05, 0.05 * 5],
  [0.0, 0.7, 0.04, 0.04 * 5],
  [0.1, 0.8, 0.03, 0.03 * 5],
  [0.2, 0.8, 0.02, 0.02 * 5],
  [0.2, 0.1, 0.01, 0.01 * 5],
  [0.3, 0.1, 0.02, 0.02 * 5],
  [0.3, 0.0, 0.03, 0.03 * 5],
].map(Dot.fromValue)) as Ref<Dot[]>

const canvasEle = ref<HTMLCanvasElement>()
let builder: Polyline3DMeshBuilder
let renderer: Polyline3DMeshRenderer
let controler: MouseTracker
function main(canvasEle: HTMLCanvasElement) {
  builder = new Polyline3DMeshBuilder(dots.value, { smooth: true, interpolationCount: 20 })
  renderer = new Polyline3DMeshRenderer(canvasEle)
  controler = new MouseTracker({
    traget: canvasEle,
    onTrack: (e) => {
      const sensitivity = 0.02
      const rotation = { x: e.movementY * sensitivity, y: e.movementX * sensitivity }
      const rotateMat = mat4.create()
      mat4.rotateX(rotateMat, rotateMat, rotation.x)
      mat4.rotateY(rotateMat, rotateMat, rotation.y)
      mat4.multiply(renderer.modelMat, rotateMat, renderer.modelMat)
      renderer.render()
    },
  })
  renderer.lightColor = vec3.fromValues(1.0, 0.0, 0.0)
  renderer.ambientLight = vec3.fromValues(0.0, 0.0, 0.4)
  renderer.eye = vec3.fromValues(-0.5, 0.0, 1.0)
  renderer.setMeshs(builder.build())
  renderer.render()
  controler.enbale()
}

function onResetRotation() {
  renderer.eye = vec3.fromValues(0, 0, 1)
  renderer.modelMat = mat4.create()
  renderer.render()
}

function onChange(v: Dot[]) {
  dots.value = v
  renderer.setMeshs(builder.build(dots.value))
  renderer.render()
}

onMounted(() => {
  main(canvasEle.value!)
})
onUnmounted(() => {
  controler.disable()
})
</script>

<template>
  <Board :dots="dots" :width="800" :height="800" @reset-rotation="onResetRotation" @change="onChange">
    <canvas ref="canvasEle" :width="800" :height="800" />
  </Board>
</template>
