import type { vec2 } from 'gl-matrix'
import type { Polyline2D, Segment2D } from './interface'
import { joinSegments, translateSegment } from './math-2d'
import { assert } from './assert'
import { splitToAdjacentPairs } from './utils'

export interface OffsetOptions {
  offset: number | number[]
  closed: boolean
}

export function offsetLine(inputLine: vec2[], options: OffsetOptions) {
  const segments = splitToSegments(inputLine)
  const offsetedSegments = offsetSegments(segments, options)
  const flattenLine = flatSegmentsToLine(offsetedSegments)
  return flattenLine
}

// iterate all ponits, for each two points make a short line
export function splitToSegments(line: Polyline2D) {
  return splitToAdjacentPairs(line)
}

// extends two adjacent lines make sure they intersect at a same point
export function offsetSegments(segments: Segment2D[], options: OffsetOptions) {
  const { offset, closed } = options
  const _offsets = Array.isArray(offset) ? offset : new Array<number>(segments.length + 1).fill(offset)
  assert(_offsets.length === segments.length + 1, `offset length: ${_offsets.length} must be same as line length: ${segments.length + 1}.`)

  const offsetedSegments = segments.reduce<[vec2, vec2][]>((segments, currSegment, i) => {
    const _offset = [_offsets[i], _offsets[i + 1]] as const
    const translatedSegment = translateSegment(currSegment, _offset)

    if (i === 0) {
      segments.push(translatedSegment)
    }
    else {
      const preSegment = segments[i - 1]
      const [newPre, newCurr] = joinSegments(preSegment, translatedSegment, ['tail', 'head'])
      segments.pop()
      segments.push(newPre, newCurr)
    }
    return segments
  }, [])

  if (closed) {
    const [tail, head] = [offsetedSegments[offsetedSegments.length - 1], offsetedSegments[0]]
    const [newTail, newHead] = joinSegments(tail, head, ['tail', 'head'])
    offsetedSegments[offsetedSegments.length - 1] = newTail
    offsetedSegments[0] = newHead
  }

  return offsetedSegments
}

// flatten multiple lines into one ploylines
export function flatSegmentsToLine(segments: Segment2D[]) {
  return segments.reduce<vec2[]>((line, segment, i) => {
    if (i === 0)
      line.push(segment[0])
    line.push(segment[1])
    return line
  }, [])
}
