<script lang='ts' setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Dot, MouseTracker } from '../src'

const props = defineProps<{
  index: number
  dot: Dot
  boardSize: { width: number; height: number }
}>()
const emit = defineEmits<{ (e: 'change', v: Dot): void }>()
const vmodelDot = computed({
  get: () => props.dot,
  set: v => emit('change', v),
})
const inputVisible = ref(false)
const sizeInputValue = computed({
  get: () => props.dot.size * 1000,
  set: (v) => {
    const { dot } = props
    const size = Number(v) / 1000
    vmodelDot.value = new Dot(dot.x, dot.y, size, dot.depth)
  },
})
const depthInputValue = computed({
  get: () => props.dot.depth * 100,
  set: (v) => {
    const { dot } = props
    const depth = Number(v) / 100
    vmodelDot.value = new Dot(dot.x, dot.y, dot.size, depth)
  },
})
function toggleInputVisible() {
  inputVisible.value = !inputVisible.value
}

const wrapperRef = ref<Element>()
function onWindowMouseDown(e: Event) {
  if (wrapperRef.value) {
    const elements: any[] = [wrapperRef.value, ...Array.from(wrapperRef.value.children)]
    if (!elements.includes(e.target))
      inputVisible.value = false
  }
}

const dotRef = ref()
let mouseTracker: MouseTracker
onMounted(() => {
  mouseTracker = new MouseTracker({
    traget: dotRef.value,
    onTrack: (e) => {
      const { dot, boardSize } = props
      vmodelDot.value = new Dot(
        dot.x + e.movementX * 2 / boardSize.width,
        dot.y - e.movementY * 2 / boardSize.height,
        dot.size, dot.depth,
      )
    },
  })
  mouseTracker.enbale()
  window.addEventListener('mousedown', onWindowMouseDown)
})
onUnmounted(() => {
  mouseTracker.disable()
  window.removeEventListener('mousedown', onWindowMouseDown)
})
</script>

<template>
  <div ref="wrapperRef" class="board-dot-wrapper">
    <input v-if="inputVisible" v-model="sizeInputValue" class="board-dot-size-input" type="range" min="0" max="100" setp="1">
    <input v-if="inputVisible" v-model="depthInputValue" class="board-dot-depth-input" type="range" min="0" max="100" setp="1">
    <button ref="dotRef" class="board-dot" @mousedown="toggleInputVisible">
      {{ index }}
    </button>
  </div>
</template>

<style scoped>
.board-dot-wrapper {
  position: absolute;
  left: calc(v-bind(dot.x) * 100%);
  top: calc(v-bind(dot.y) * 100%);
  width: calc(v-bind(dot.size) * 100%);
  height: calc(v-bind(dot.size) * 100%);
  transform: translate(-50%, -50%) scale(2, -2);
}
.board-dot {
  width:100%;
  height: 100%;
  padding: 0;
  border-radius: 50%;
  background-color: #ffffff2f;
  display: flex;
  align-items: center;
  justify-content: center;
}
.board-dot:active {
  color:#000;
  background-color: #fff;
}
.board-dot-size-input {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -200%);
}
.board-dot-depth-input {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-100%, 200%) rotate(90deg);
}
</style>
