export type Vector2D = [number, number]

export const add = (v2: Vector2D) => (v1: Vector2D) => {
	return v1.map((value1, i) => {
		const value2 = v2[i]
		return value1 + value2
	}) as Vector2D
}

export const scale = (n: number) => (v1: Vector2D) => {
	return v1.map((value) => {
		return value * n
	}) as Vector2D
}

export const substract = (v2: Vector2D) => (v1: Vector2D) => {
	return add(scale(-1)(v2))(v1)
}

export const divide = (n: number) => (v1: Vector2D) => {
	return scale(n === 0 ? Infinity : 1 / n)(v1)
}
