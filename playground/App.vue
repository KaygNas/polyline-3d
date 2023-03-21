<script lang="ts" setup>
import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { mat4, vec3 } from 'gl-matrix'
import { Dot, MouseTracker, Polyline3DMeshBuilder, Polyline3DMeshRenderer } from '../src'
import Board from './board.vue'
import dotsOfHao from './dots-hao.json'

// the outline of "好"
const dots = ref(dotsOfHao.map(Dot.fromValue)) as Ref<Dot[]>
const smooth = ref(true)

const canvasEle = ref<HTMLCanvasElement>()
let builder: Polyline3DMeshBuilder
let renderer: Polyline3DMeshRenderer
let controler: MouseTracker
function main(canvasEle: HTMLCanvasElement) {
  builder = new Polyline3DMeshBuilder(dots.value, { smooth: smooth.value, interpolationCount: 20 })
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

function onSmoothChange(v: boolean) {
  smooth.value = v
  builder.setOptions({ smooth: v })
  renderer.setMeshs(builder.build())
  renderer.render()
}
function onResetRotation() {
  renderer.eye = vec3.fromValues(0, 0, 1)
  renderer.modelMat = mat4.create()
  renderer.render()
}

function onChange(v: Dot[]) {
  dots.value = v
  builder.setDots(v)
  renderer.setMeshs(builder.build())
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
  <Board
    :dots="dots" :width="800" :height="800" :smooth="smooth"
    @smooth-change="onSmoothChange"
    @reset-rotation="onResetRotation"
    @change="onChange"
  >
    <canvas ref="canvasEle" :width="800" :height="800" />
  </Board>
</template>
