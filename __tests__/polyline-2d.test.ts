import { vec2 } from 'gl-matrix'
import { offsetLine } from '../src/core/polyline-2d'
import { roundVec2 } from './test-utils'

describe('offsetLine', () => {
  it('should work on positive offset', () => {
    const line = [
      [0.0, 0.0],
      [0.0, 2.0],
      [2.0, 2.0],
      [2.0, 4.0],
      [4.0, 4.0],
      [4.0, 0.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const expected = [
      [-1.0, 0.0],
      [-1.0, 3.0],
      [1.0, 3.0],
      [1.0, 5.0],
      [5.0, 5.0],
      [5.0, 0.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const result = offsetLine(line, { offset: 1, closed: true }).map(values => roundVec2(values))
    expect(result).toEqual(expected)
  })
  it('should work on negative offset', () => {
    const line = [
      [0.0, 0.0],
      [0.0, 2.0],
      [2.0, 2.0],
      [2.0, 4.0],
      [4.0, 4.0],
      [4.0, 0.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const expected = [
      [1.0, 0.0],
      [1.0, 1.0],
      [3.0, 1.0],
      [3.0, 3.0],
      [3.0, 3.0],
      [3.0, 0.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const result = offsetLine(line, { offset: -1, closed: true }).map(values => roundVec2(values))
    expect(result).toEqual(expected)
  })
  it('should work when line closed', () => {
    const line = [
      [0.0, 0.0],
      [0.0, 2.0],
      [2.0, 2.0],
      [2.0, 4.0],
      [4.0, 4.0],
      [4.0, 0.0],
      [0.0, 0.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const expected = [
      [-1.0, -1.0],
      [-1.0, 3.0],
      [1.0, 3.0],
      [1.0, 5.0],
      [5.0, 5.0],
      [5.0, -1.0],
      [-1.0, -1.0],
    ].map(values => vec2.fromValues(values[0], values[1]))
    const result = offsetLine(line, { offset: 1, closed: true }).map(values => roundVec2(values))
    expect(result).toEqual(expected)
  })
})
