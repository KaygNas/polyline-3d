<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { LineDrawer3D } from './line-drawer3d'
import { polylines } from './samples'
const canvasEle = ref<HTMLCanvasElement>()
const main = async (canvasEle: HTMLCanvasElement) => {
	const lineDrawer = new LineDrawer3D(canvasEle)
	lineDrawer.bindModel3D(polylines.toModel3D())
	lineDrawer.draw()
}

onMounted(() => {
	main(canvasEle.value!)
})
</script>

<template>
	<canvas ref="canvasEle" :width="800" :height="800" />
</template>
