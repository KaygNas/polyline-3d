<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { LineDrawer } from './line-drawer'
import { samples, samples2 } from './samples'

const canvasEle = ref<HTMLCanvasElement>()
const main = async (canvasEle: HTMLCanvasElement) => {
	const lineDrawer = new LineDrawer(canvasEle, {
		lineCap: 'round',
		lineStyle: '#ee0000',
		lineWidth: 5,
		transform: [1, 0, 0, 1, 100, 0],
	})
	lineDrawer.drawPolygon(samples2)

	lineDrawer.setOption({
		lineCap: 'round',
		lineStyle: '#ee0000',
		lineWidth: 5,
		transform: [1, 0, 0, 1, 100, 100],
	})
	lineDrawer.drawPolygon(samples2)

	lineDrawer.setOption({
		lineCap: 'round',
		lineStyle: '#00ee00',
		lineWidth: 5,
		transform: [1, 0, 0, 1, 100, 100],
	})
	lineDrawer.drawCatmullRomSpline(samples2, { animate: false })

	lineDrawer.setOption({
		lineCap: 'round',
		lineStyle: '#00ee00',
		lineWidth: 5,
		transform: [1, 0, 0, 1, 100, 200],
	})
	await lineDrawer.drawCatmullRomSpline(samples2, { animate: true })

	// for (let index = 0; index < samples.length; index++) {
	// 	const points = samples[index]
	// 	await lineDrawer.drawCatmullRomSpline(points, { animate: true })
	// }
}

onMounted(() => {
	main(canvasEle.value!)
})
</script>

<template>
	<canvas ref="canvasEle" :width="2480" :height="3510" />
</template>
