import { vec2, vec3 } from 'gl-matrix'
import { identity, pipe } from 'fp-ts/lib/function'
import { equals, flatMap, head, last, map, range, sum } from 'lodash/fp'
import type { Polyline2D, Polyline3D } from '../core'
import { catmullRomInterpolate, offsetLine, splitToAdjacentPairs } from '../core'
import type { Dot } from './dot'
import type { MeshModel } from './interface'

interface Polyline3DMeshBuilderOptions { smooth: boolean; interpolationCount: number}

/**
 * A builder for ployline in 3D.
 * It accepts a batch of dots and link dots to line, offset the line according to the size of dots, we will receive two lines. The two lines could easily form a 2D shape as if a line with changing width.
 * Next step, we translate each dots of the two lines in z-direction, the distance of translation should also depends on size of the dots, therefore we would have two new lines.
 * With these four lines, we could form a 3D shape like a tunnel. To Make it renderable in WebGL, we should make a array of indices, which indicates vertices of all triangles that can form the tunnel like shape.
 * It would not be difficult to achieve, since each line has same amount of dots, follow the pattern below:
 * i0+1 -- i1+1
 *    | // |
 *   i0 -- i1
 * TriangleA (i0, i1, i1+1) and TriangleB (i0, i1+1, i0+1), together make a rectangle, repeat it on each two lines then it would be done.
 */
export class Polyline3DMeshBuilder {
  constructor(
    private dots: Dot[] = [],
    private options: Polyline3DMeshBuilderOptions = { smooth: true, interpolationCount: 10 },
  ) {}

  setOptions(options: Polyline3DMeshBuilderOptions) {
    Object.assign(this.options, options)
  }

  setDots(dots: Dot[]) {
    this.dots = dots
  }

  build(dots: Dot[] = this.dots) {
    if (dots.length < 2)
      return []

    const { options } = this
    return pipe(
      dots,
      makePolylines3D,
      options.smooth ? map(line => smoothLine(line, options)) : identity,
      groupIntoFourPairs,
      map(makeMeshModel),
    )
  }
}

function makePolylines3D(dots: Dot[]): Polyline3D[] {
  const line = dots.map(d => vec2.fromValues(d.x, d.y))
  const closed = equals(head(line), last(line))
  const positiveOffset = dots.map(d => d.size)
  const negativeOffset = dots.map(d => -d.size)
  const depthOffset = dots.map(dot => -Math.abs(dot.depth))
  const zeroOffset = dots.map(_ => 0)
  const _line1 = offsetLine(line, { offset: positiveOffset, closed })
  const _line2 = offsetLine(line, { offset: negativeOffset, closed })
  const line1 = polyline3DFrom2D(_line1, zeroOffset)
  const line2 = polyline3DFrom2D(_line2, zeroOffset)
  const line3 = polyline3DFrom2D(_line2, depthOffset)
  const line4 = polyline3DFrom2D(_line1, depthOffset)
  return [line1, line2, line3, line4]
}
function polyline3DFrom2D(line: Polyline2D, z: number[]): Polyline3D {
  return line.map((v, i) => vec3.fromValues(v[0], v[1], z[i]))
}

function smoothLine(line: Polyline3D, options: { interpolationCount: number } = { interpolationCount: 3 }): Polyline3D {
  return pipe(
    line,
    map(v => Array.from(v.values())),
    v => catmullRomInterpolate(v, { ...options, componentCount: 3 }),
    map(v => vec3.fromValues(v[0], v[1], v[2])),
  )
}

type Polyline3DPair = [Polyline3D, Polyline3D]
function groupIntoFourPairs(polylines: Polyline3D[]) {
  return polylines.reduce<Polyline3DPair[]>((pairs, line, i) => {
    const nextLine = polylines[(i + 1) % polylines.length]
    const pair: Polyline3DPair = [line, nextLine]
    pairs.push(pair)
    return pairs
  }, [])
}

function makeMeshModel(pair: Polyline3DPair): MeshModel {
  const indices = makeIndices(pair)
  const positions = makeVertexPositions(pair)
  const colors = makeVertexColors(pair)
  const normals = makeVertexNormals(pair)
  return { indices, positions, colors, normals }
}
function makeVertexPositions(polylines: Polyline3D[]) {
  const _vertices = polylines
    .flatMap(identity)
    .flatMap(v => [...Array.from(v.values()), 1.0])
  const vertices = new Float32Array(_vertices)
  return vertices
}
function makeIndices(polylines: Polyline3D[]) {
  const lineCount = polylines.length
  const pointPerLine = polylines[0].length
  const indicesParternOf = (i: number, offset: number) => [i, i + offset, i + offset + 1, i, i + offset + 1, i + 1]

  const _indices = range(0, lineCount - 1)
    .flatMap((_, lineIndex) => range(0, pointPerLine - 1).map((_, i) => [i + lineIndex * pointPerLine, pointPerLine]))
    .flatMap(([i, offset]) => indicesParternOf(i, offset))
  const indices = new Uint16Array(_indices)
  return indices
}
function makeVertexColors(pair: Polyline3DPair) {
  const length = pipe(pair, map(l => l.length), sum)
  const _colors = new Array<number[]>(length).fill([1.0, 1.0, 1.0, 1.0]).flatMap(identity)
  const colors = new Float32Array(_colors)
  return colors
}
function makeVertexNormals(pair: Polyline3DPair) {
  const normalsOfRectangles = pipe(
    pair,
    makeSegmentPairs,
    map(normalOfSegmentPair),
    map(n => [...Array.from(n), 1.0]),
    arr => [...arr, last(arr)!],
    arr => [...arr, ...arr],
    flatMap(identity),
  )
  const normals = new Float32Array(normalsOfRectangles)
  return normals
}
type Segment = [vec3, vec3]
type SegmentPair = [Segment, Segment]
function normalOfSegmentPair(segmentPair: SegmentPair) {
  const segment1 = [segmentPair[0][0], segmentPair[1][1]]
  const segment2 = [segmentPair[0][1], segmentPair[1][0]]
  return pipe(
    [segment1, segment2],
    map(([a, b]) => vec3.subtract(vec3.create(), a, b)),
    ([v1, v2]) => vec3.cross(vec3.create(), v2, v1),
    v => vec3.normalize(vec3.create(), v),
  )
}
function makeSegmentPairs(linePair: Polyline3DPair) {
  const [line1, line2] = linePair.map(splitToAdjacentPairs)
  return line1.map((_, i) => [line1[i], line2[i]] as SegmentPair)
}
