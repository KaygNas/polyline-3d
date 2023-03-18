<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { mat4, vec3 } from 'gl-matrix'
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
function main(canvasEle: HTMLCanvasElement) {
  const builder = new Polyline3DMeshBuilder(dots, { smooth: true, interpolationCount: 20 })
  const renderer = new Polyline3DMeshRenderer(canvasEle)
  renderer.lightColor = vec3.fromValues(1.0, 0.0, 0.0)
  renderer.ambientLight = vec3.fromValues(0.0, 0.0, 0.4)
  renderer.addMesh(builder.build())
  renderer.render()
  enableRotationControl(renderer)
}
function enableRotationControl(renderer: Polyline3DMeshRenderer) {
  const onkeydown = (e: KeyboardEvent) => {
    const { modelMat } = renderer
    const tranformMat = mat4.create()
    switch (e.key) {
      case 'ArrowLeft':
        mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(0.0, 1.0, 0.0))
        break
      case 'ArrowRight':
        mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(0.0, 1.0, 0.0))
        break
      case 'ArrowUp':
        mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(1.0, 0.0, 0.0))
        break
      case 'ArrowDown':
        mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(1.0, 0.0, 0.0))
        break
      default:
    }
    mat4.multiply(modelMat, modelMat, tranformMat)
    renderer.render()
  }
  window.addEventListener('keydown', onkeydown)
}

onMounted(() => {
  main(canvasEle.value!)
})
</script>

<template>
  <canvas ref="canvasEle" :width="800" :height="800" />
</template>
