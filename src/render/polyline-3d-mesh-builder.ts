import { vec2, vec3 } from 'gl-matrix'
import { identity, pipe } from 'fp-ts/lib/function'
import { equals, head, last, map, range } from 'lodash/fp'
import type { Polyline2D, Polyline3D } from '../core'
import { catmullRomInterpolate, offsetLine } from '../core'
import type { Dot } from './dot'
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
export function buildPolyline3DMesh(dots: Dot[]) {
  return pipe(dots, makePolyline3D, map(smoothLine), makeMesh)
}

function makePolyline3D(dots: Dot[]): Polyline3D[] {
  const line = dots.map(d => vec2.fromValues(d.x, d.y))
  const closed = equals(head(line), last(line))
  const positiveOffset = dots.map(d => d.size)
  const negativeOffset = dots.map(d => -d.size)
  const depthOffset = pipe(negativeOffset, map(v => v * 3))
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

function smoothLine(line: Polyline3D): Polyline3D {
  return pipe(
    line,
    map(v => Array.from(v.values())),
    v => catmullRomInterpolate(v, { componentCount: 3, interpolationCount: 3 }),
    map(v => vec3.fromValues(v[0], v[1], v[2])),
  )
}

function makeMesh(polylines: Polyline3D[]) {
  const indices = makeIndices(polylines)
  const vertices = makeVertices(polylines)
  const colors = makeColors(vertices.length)
  const normals = makeNormals(vertices.length)
  return { indices, vertices, colors, normals }
}
function makeVertices(polylines: Polyline3D[]) {
  const _vertices = polylines.concat(polylines[0]).flatMap(identity).flatMap(v => Array.from(v.values()))
  const vertices = new Float32Array(_vertices)
  return vertices
}
function makeIndices(polylines: Polyline3D[]) {
  const lineCount = polylines.length
  const pointPerLine = polylines[0].length
  const indicesParternOf = (i: number, offset: number) => [i, i + offset, i + offset + 1, i, i + offset + 1, i + 1]

  const _indices = range(0, lineCount)
    .flatMap((_, lineIndex) => range(0, pointPerLine - 1).map((_, i) => [i + lineIndex * pointPerLine, pointPerLine]))
    .flatMap(([i, offset]) => indicesParternOf(i, offset))
  const indices = new Uint8Array(_indices)
  return indices
}
function makeColors(length: number) {
  const _colors = new Array<number[]>(length).fill([0.0, 0.0, 1.0]).flatMap(identity)
  const colors = new Float32Array(_colors)
  return colors
}
function makeNormals(length: number) {
  const _normals = new Array<number[]>(length).fill([0.0, 0.0, 1.0]).flatMap(identity)
  const normals = new Float32Array(_normals)
  return normals
}
