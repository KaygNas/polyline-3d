import { vec2 } from 'gl-matrix'
import type { Segment2D } from '../src/core/interface'
import {
  intersectOfTwoLine,
  joinSegments,
  orthOfSegment,
} from '../src/core/math-2d'
import { roundVec2 } from './test-utils'

describe('intersectOfTwoLine', () => {
  it('should return undefined only when parralle', () => {
    const A = vec2.fromValues(0.0, 0.0)
    const B = vec2.fromValues(0.0, 1.0)
    const C = vec2.fromValues(1.0, 0.0)
    const D = vec2.fromValues(0.0, 1.0)
    expect(intersectOfTwoLine([A, B], [A, B])).toBe(undefined)
    expect(intersectOfTwoLine([A, B], [C, D])).not.toBe(undefined)
  })

  it('should work on vertical lines', () => {
    const A = vec2.fromValues(0.0, 0.0)
    const B = vec2.fromValues(0.0, 1.0)
    const C = vec2.fromValues(1.0, 2.0)
    const D = vec2.fromValues(3.0, 2.0)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(0.0, 2.0))
  })

  it('should work on horizontal lines', () => {
    const A = vec2.fromValues(0.0, 0.0)
    const B = vec2.fromValues(2.0, 0.0)
    const C = vec2.fromValues(3.0, 1.0)
    const D = vec2.fromValues(3.0, 4.0)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(3.0, 0.0))
  })

  it('should work on orth lines', () => {
    const A = vec2.fromValues(0.0, 0.0)
    const B = vec2.fromValues(2.0, 2.0)
    const C = vec2.fromValues(0.0, 2.0)
    const D = vec2.fromValues(2.0, 0.0)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(1.0, 1.0))
  })

  it('should work on lines intersected at on end', () => {
    const A = vec2.fromValues(0.0, 0.0)
    const B = vec2.fromValues(2.0, 1.0)
    const C = vec2.fromValues(-2.0, 2.0)
    const D = vec2.fromValues(-1.0, 1.0)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(0.0, 0.0))
  })

  it('should work on other lines intersected at middle', () => {
    const A = vec2.fromValues(1.0, 1.0)
    const B = vec2.fromValues(3.0, 2.0)
    const C = vec2.fromValues(3.0, 2.25)
    const D = vec2.fromValues(4.0, 3.0)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(2.0, 1.5))
  })

  it('should work on other lines intersected outside', () => {
    const A = vec2.fromValues(1.0, 1.0)
    const B = vec2.fromValues(3.0, 2.0)
    const C = vec2.fromValues(8.0, 5.0)
    const D = vec2.fromValues(6.0, 3.75)
    expect(intersectOfTwoLine([A, B], [C, D])?.point).toEqual(vec2.fromValues(4.0, 2.5))
  })
})

describe('orthOfSegment', () => {
  it('should return orth unit vector of segment', () => {
    const result = orthOfSegment([vec2.fromValues(2.0, 2.0), vec2.fromValues(2.0, 4.0)])
    const expected = vec2.fromValues(-1.0, 0.0)
    expect(roundVec2(result)).toEqual(expected)
  })
})

describe('joinSegments', () => {
  it('should work when already intersected', () => {
    const a: Segment2D = [vec2.fromValues(0.0, 0.0), vec2.fromValues(0.0, 1.0)]
    const b: Segment2D = [vec2.fromValues(1.0, 0.0), vec2.fromValues(1.0, 1.0)]
    const expected: ReturnType<typeof joinSegments> = [
      [vec2.fromValues(0.0, 0.0), vec2.fromValues(0.0, 1.0)],
      [vec2.fromValues(1.0, 0.0), vec2.fromValues(1.0, 1.0)],
    ]
    expect(joinSegments(a, b)).toEqual(expected)
  })
  it('should clip when intersect at middle', () => {
    const a: Segment2D = [vec2.fromValues(0.0, 0.0), vec2.fromValues(2.0, 2.0)]
    const b: Segment2D = [vec2.fromValues(0.0, 2.0), vec2.fromValues(2.0, 0.0)]
    const expected: ReturnType<typeof joinSegments> = [
      [vec2.fromValues(0.0, 0.0), vec2.fromValues(1.0, 1.0)],
      [vec2.fromValues(0.0, 2.0), vec2.fromValues(1.0, 1.0)],
    ]
    expect(joinSegments(a, b)).toEqual(expected)
  })
  it('should expand when intersect at outside', () => {
    const a: Segment2D = [vec2.fromValues(0.0, 0.0), vec2.fromValues(2.0, 2.0)]
    const b: Segment2D = [vec2.fromValues(0.0, 6.0), vec2.fromValues(1.0, 5.0)]
    const expected: ReturnType<typeof joinSegments> = [
      [vec2.fromValues(0.0, 0.0), vec2.fromValues(3.0, 3.0)],
      [vec2.fromValues(0.0, 6.0), vec2.fromValues(3.0, 3.0)],
    ]
    expect(joinSegments(a, b)).toEqual(expected)
  })
})
