import { Vector2D } from './vector2d'
import { assert } from './assert'
import { curry, range } from 'lodash/fp'

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
export const lerpP1P2 = (
	{ p0, p1, p2, p3 }: { p0: number; p1: number; p2: number; p3: number },
	t: number,
) => {
	return (
		0.5 *
		(2 * p1 +
			(-p0 + p2) * t +
			(2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2 +
			(-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)
	)
}

export const lerpN = <T = number[]>(
	n: number,
	{ p0, p1, p2, p3 }: { p0: number[]; p1: number[]; p2: number[]; p3: number[] },
	t: number,
) => {
	assert(
		n === p0.length && n === p1.length && n === p2.length && n === p3.length,
		`each point should have same length of ${n}`,
	)
	assert(t >= 1 || t >= 0, 't should be [0,1]')

	return range(0, n).map(
		//
		(_, i) => lerpP1P2({ p0: p0[i], p1: p1[i], p2: p2[i], p3: p3[i] }, t),
	) as T
}
