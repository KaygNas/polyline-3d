<script lang='ts' setup>
import { nextTick, ref } from 'vue'
import { last } from 'lodash/fp'
import { Dot } from '../src'
import BoradDot from './borad-dot.vue'
const props = defineProps<{ dots: Dot[]; width: number; height: number }>()
const emit = defineEmits<{
  (e: 'resetRotation'): void
  (e: 'change', v: Dot[]): void
}>()
const boardVisible = ref(false)
function toggleBoardVisible() {
  boardVisible.value = !boardVisible.value
}
function newDot() {
  const { dots } = props
  const OFFSET_STEP = 0.05
  const DEFAULT_SIZE = 0.05
  const DEFAULT_DEPTH = 0.5
  if (dots.length === 0) {
    emit('change', [new Dot(0, 0, DEFAULT_SIZE, DEFAULT_DEPTH)])
  }
  else if (dots.length === 1) {
    const lastDot = last(dots)!
    const dot = new Dot(lastDot.x, lastDot.y + OFFSET_STEP, DEFAULT_SIZE, DEFAULT_DEPTH)
    emit('change', [lastDot, dot])
  }
  else {
    const [dot1, dot2] = dots.slice(dots.length - 2)
    const signOf = (n: number) => n === 0 ? 0 : n / n
    const offsetX = signOf(dot2.x - dot1.x) * OFFSET_STEP
    const offsetY = signOf(dot2.y - dot1.y) * OFFSET_STEP
    const dot = new Dot(dot2.x + offsetX, dot2.y + offsetY, DEFAULT_SIZE, DEFAULT_DEPTH)
    emit('change', [...dots, dot])
  }
}
async function clearDots() {
  emit('change', [])
}
function onChange(index: number, dot: Dot) {
  const { dots } = props
  const _dots = [...dots.slice(0, index), dot, ...dots.slice(index + 1)]
  emit('change', _dots)
}
</script>

<template>
  <section class="board">
    <slot />

    <div class="operation-bar">
      <button @click="emit('resetRotation')">
        reset rotation
      </button>

      <button @click="toggleBoardVisible">
        {{ boardVisible ? 'save' : 'edit' }}
      </button>
      <button v-if="boardVisible" @click="newDot">
        new dot
      </button>
      <button v-if="boardVisible" @click="clearDots">
        clear
      </button>
    </div>

    <div v-if="boardVisible" class="board-dots">
      <template v-for="dot, index in dots" :key="index">
        <BoradDot
          :index="index"
          :dot="dot"
          :board-size="{ width, height }"
          @change="onChange(index, $event)"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.board{
  position: relative;
  width: calc(v-bind(width) * 1px);
  height: calc(v-bind(height) * 1px);
}
.operation-bar{
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.board-dots{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform: scale(0.5, -0.5) translate(50%, 50%);
}
</style>
