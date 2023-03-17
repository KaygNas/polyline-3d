import { Vector2D } from './vector2d'

export class Point2D {
	constructor(public vec: Vector2D = [0, 0], public force: number = 0, public time: number = 0) {}
	toValues() {
		return [...this.vec, this.force, this.time]
	}
	static fromValues(values: [number, number, number, number]) {
		return new Point2D([values[0], values[1]], values[2], values[3])
	}
}
