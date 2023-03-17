import { pipe } from 'fp-ts/lib/function'
import { flatMap, map, range } from 'lodash/fp'
import { assert } from './assert'

export interface InterpolationOptions {
  // TODO: 如何选择合适的插值数量？换言之 t 的值应该如何确定？
  interpolationCount: number
  componentCount: number
}
export function catmullRomInterpolate(vector: number[][], options: InterpolationOptions) {
  if (vector.length < 3)
    return vector

  const { interpolationCount, componentCount } = options
  const _vector = [vector[0], ...vector, vector[vector.length - 1]]
  const interpolatedPoints = pipe(
    // 取第 1 个到第 n-2 个点进行插值
    range(1, _vector.length - 2),
    map(index =>
      pipe(
        range(0, interpolationCount + 1),
        map(value => value / (interpolationCount + 1)),
        // 插入 interpolationCount 个点，其中 t 属于 [0, 1)
        map((t) => {
          const v = interpolateN(
            componentCount,
            [
              _vector[index - 1],
              _vector[index + 0],
              _vector[index + 1],
              _vector[index + 2],
            ],
            t,
          )
          return v
        }),
      ),
    ),
    flatMap(_ => _),
  )

  return [...interpolatedPoints, vector[vector.length - 1]]
}

/**
 * catmull-rom spline
 * http://www.mvps.org/directx/articles/catmull/
 * q(t) = 0.5 * ((2 * P1) +
                 (-P0 + P2) * t +
                 (2*P0 - 5*P1 + 4*P2 - P3) * t2 +
                 (-P0 + 3*P1- 3*P2 + P3) * t3)）
 *
 * interpolate between specific points p_0, p_1, p_2 to obtain
 * a smooth spline which is interpolation and locality
 */
export function interpolate(
  { p0, p1, p2, p3 }: { p0: number; p1: number; p2: number; p3: number },
  t: number,
) {
  return (0.5 * (2 * p1
                    + (-p0 + p2) * t
                    + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2
                    + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
}

export function interpolateN<T extends number[] = number[]>(n: number, points: T[], t: number) {
  const [p0, p1, p2, p3] = points
  assert(points.length === 4, 'points.length should equals 4.')
  assert(
    n === p0.length && n === p1.length && n === p2.length && n === p3.length,
                    `each point should have same length of ${n}`,
  )
  assert(t >= 1 || t >= 0, 't should be [0,1]')

  return range(0, n).map((_, i) =>
    interpolate({ p0: p0[i], p1: p1[i], p2: p2[i], p3: p3[i] }, t),
  ) as T
}
