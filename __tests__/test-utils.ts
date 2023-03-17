import { vec2 } from 'gl-matrix'

export function roundVec2(values: vec2) {
  const round = (n: number) => (Math.abs(n) - Number.EPSILON < 0.0000000001 ? 0 : n)
  return vec2.fromValues(round(values[0]), round(values[1]))
}
