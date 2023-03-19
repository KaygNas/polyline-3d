<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { mat4, vec3 } from 'gl-matrix'
import { Dot, MouseTracker, Polyline3DMeshBuilder, Polyline3DMeshRenderer } from '../src'

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
function main(canvasEle: HTMLCanvasElement) {
  const builder = new Polyline3DMeshBuilder(dots, { smooth: true, interpolationCount: 20 })
  const renderer = new Polyline3DMeshRenderer(canvasEle)
  const controler = new MouseTracker({
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
  renderer.addMesh(builder.build())
  renderer.render()
  controler.enbale()

  onUnmounted(() => {
    controler.disable()
  })
}

onMounted(() => {
  main(canvasEle.value!)
})
</script>

<template>
  <canvas ref="canvasEle" :width="800" :height="800" />
</template>
