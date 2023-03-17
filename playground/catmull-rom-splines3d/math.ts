import { mat2d, mat3, mat4, vec2 } from 'gl-matrix'

export function intersectOfTwoLine(line1: vec2[], line2: vec2[]) {
	// line1: f(t) = A + t * AB
	// line2: g(s) = C + s * CD
	// if AB parrelle to CD then return None
	// let line1 = line2 => A + t * AB = C + s * CD
	// then we would have two equation:
	//   a_1 + t * (b_1 - a_1) = c_1 + s * (d_1 - c_1)
	//   a_2 + t * (b_2 - a_2) = c_2 + s * (d_2 - c_2)
	// if a_1 euqals b_1 and a_2 equals b_2 then throw error
	// if a_1 equals b_1 then
	//   s = (a_1 - c_1) / (d_1 - c_1)
	//   t = (c_2 + s * (d_2 - c_2) - a_2) / (b_2 - a_2)
	// if a_2 equals b_2 then
	//   s = (a_2 - c_2) / (d_2 - c_2)
	//   t = (c_1 + s * (d_1 - c_1) - a_1) / (b_1 - a_1)
	// else solve the equation
	//   t = s * (d_1 - c_1) / (b_1 - a_1) + (c_1 - a_1) / (b_1 - a_1)
	//   t = s * (d_2 - c_2) / (b_2 - a_2) + (c_2 - a_2) / (b_2 - a_2)
	// we could get s by elimate t
	//   s * ((d_1 - c_1) / (b_1 - a_1) - (d_2 - c_2) / (b_2 - a_2))
	//     = ((c_2 - a_2) / (b_2 - a_2) - (c_1 - a_1) / (b_1 - a_1))
	//   s = ((c_2 - a_2) / (b_2 - a_2) - (c_1 - a_1) / (b_1 - a_1)) / ((d_1 - c_1) / (b_1 - a_1) - (d_2 - c_2) / (b_2 - a_2))
	const [A, B] = line1
	const [C, D] = line2
	const AB = vec2.subtract(vec2.create(), B, A)
	const CD = vec2.subtract(vec2.create(), D, C)

	const isParrelle = vec2.angle(AB, CD) % Math.PI < Number.EPSILON
	if (isParrelle) return undefined

	const [a_1, a_2] = A
	const [b_1, b_2] = B
	const [c_1, c_2] = C
	const [d_1, d_2] = D
	let s: number
	let t: number

	if (a_1 === b_1) {
		s = (a_1 - c_1) / (d_1 - c_1)
		t = (c_2 + s * (d_2 - c_2) - a_2) / (b_2 - a_2)
	} else if (a_2 === b_2) {
		s = (a_2 - c_2) / (d_2 - c_2)
		t = (c_1 + s * (d_1 - c_1) - a_1) / (b_1 - a_1)
	} else {
		s =
			((c_2 - a_2) / (b_2 - a_2) - (c_1 - a_1) / (b_1 - a_1)) /
			((d_1 - c_1) / (b_1 - a_1) - (d_2 - c_2) / (b_2 - a_2))
		t = (s * (d_2 - c_2)) / (b_2 - a_2) + (c_2 - a_2) / (b_2 - a_2)
	}

	const P = vec2.add(vec2.create(), A, vec2.scale(vec2.create(), AB, t))
	return { t, s, point: P }
}

export type Segment = [vec2, vec2]
export function offsetLine(inputLine: vec2[], offset: number) {
	// iterate all ponits, for each two points make a short line
	const segments = inputLine.reduce<Segment[]>((segments, point, i) => {
		const nextPoint = inputLine[i + 1]
		if (nextPoint) segments.push([point, nextPoint])
		return segments
	}, [])

	// extends two adjacent lines make sure they intersect at a same point
	const jointSegments = segments.reduce<[vec2, vec2][]>((segments, currSegment, i) => {
		const offsetV = offsetVec2OfSegment(currSegment, offset)
		const translatedSegment = translateSegment(currSegment, offsetV)

		if (i === 0) {
			segments.push(translatedSegment)
		} else {
			const preSegment = segments[i - 1]
			const [newPre, newCurr] = joinSegments(preSegment, translatedSegment, ['tail', 'head'])
			segments.pop()
			segments.push(newPre, newCurr)
		}
		return segments
	}, [])
	const headSegment = segments[0]
	const tailSegment = segments[segments.length - 1]
	const isClosed = vec2.equals(headSegment[0], tailSegment[1])
	if (isClosed) {
		const [tail, head] = [jointSegments[jointSegments.length - 1], jointSegments[0]]
		const [newTail, newHead] = joinSegments(tail, head, ['tail', 'head'])
		jointSegments[jointSegments.length - 1] = newTail
		jointSegments[0] = newHead
	}

	// flatten multiple lines into one ploylines
	const flattenSegmentsToLine = jointSegments.reduce<vec2[]>((lines, line, i) => {
		if (i === 0) lines.push(line[0])
		lines.push(line[1])
		return lines
	}, [])

	return flattenSegmentsToLine
}

function offsetVec2OfSegment([a, b]: Segment, offset: number) {
	const abOrth = orthOfSegment([a, b])
	const offsetVec2 = vec2.scale(vec2.create(), abOrth, offset)
	return offsetVec2
}

function translateSegment(segment: Segment, v: vec2) {
	const matrix = mat2d.fromTranslation(mat2d.create(), v)
	const tranlatedSegment = segment.map((point) => {
		return vec2.transformMat2d(vec2.create(), point, matrix)
	})
	return tranlatedSegment as Segment
}

export function orthOfSegment([a, b]: Segment) {
	const ab = vec2.subtract(vec2.create(), b, a)
	return vec2.normalize(
		vec2.create(),
		vec2.rotate(vec2.create(), ab, vec2.fromValues(0.0, 0.0), Math.PI / 2),
	)
}

export function joinSegments(
	segment1: Segment,
	segment2: Segment,
	prefers: ('head' | 'tail')[] = ['tail', 'tail'],
) {
	const [A, B, C, D] = [...segment1, ...segment2]
	const result = intersectOfTwoLine([A, B], [C, D])
	const newSegment1: Segment = [...segment1]
	const newSegment2: Segment = [...segment2]
	if (result) {
		const [prefer1, prefer2] = prefers
		const { t, s, point } = result
		const pointToSet = (t: number, prefer: typeof prefers[number]) => {
			if (t >= 1) {
				return 1
			} else if (t >= 0) {
				return prefer === 'head' ? 0 : 1
			} else {
				return 0
			}
		}
		const point1ToSet = pointToSet(t, prefer1)
		const point2ToSet = pointToSet(s, prefer2)
		newSegment1[point1ToSet] = point
		newSegment2[point2ToSet] = point
	}
	return [newSegment1, newSegment2] as const
}
