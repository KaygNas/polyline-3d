import { vec2, vec3 } from 'gl-matrix'
import { Point2D } from '../catmull-rom-splines/point2d'
import { Model3D } from './line-drawer3d'
import { offsetLine } from './math'
import { pipe } from 'fp-ts/lib/function'
import { flatMap, map, range, tap } from 'lodash/fp'
import { lerpN } from './catmull-rom-splines'

export class Point3D {
	constructor(
		public vec: vec3 = vec3.create(),
		public force: number = 0,
		public time: number = 0,
	) {}

	toValues() {
		return [...this.vec, this.force, this.time]
	}

	static fromValues(values: [number, number, number, number, number]) {
		return new Point3D(vec3.fromValues(values[0], values[1], values[2]), values[3], values[4])
	}

	static fromPoint2D(point2d: Point2D) {
		return Point3D.fromValues([...point2d.vec, 0, point2d.force, point2d.time])
	}
}

interface PolyLines3DOptions {
	lineWidth: number
}
/**
 * 3维的多段线
 *
 * 可以由 Point2D[] 导入
 */
export class PolyLines3D {
	constructor(public points: Point3D[], public options: PolyLines3DOptions) {}

	toModel3D() {
		const { lineWidth } = this.options
		// const { points } = this
		const points = PolyLines3D.toCatmullRomSplines(this.points)
		const halfLineWidth = lineWidth / 2
		const points1 = PolyLines3D.offsetPoints(points, halfLineWidth)
		const points2 = PolyLines3D.offsetPoints(points, -halfLineWidth)
		const points3 = PolyLines3D.translatePointsByForce(points2)
		const points4 = PolyLines3D.translatePointsByForce(points1)
		const lines = [
			{
				points: points1,
				color: vec3.fromValues(1.0, 0.0, 0.0),
			},
			{
				points: points2,
				color: vec3.fromValues(1.0, 0.0, 0.0),
			},
			{
				points: points3,
				color: vec3.fromValues(0.0, 1.0, 0.0),
			},
			{
				points: points4,
				color: vec3.fromValues(0.0, 1.0, 0.0),
			},
			{
				points: points1,
				color: vec3.fromValues(1.0, 0.0, 0.0),
			},
		]
		console.log(lines.map((l) => l.points).map((p) => p.map((p) => p.toValues())))

		const lineCount = lines.length
		const pointCountPerLine = lines[0].points.length
		const vertices = new Float32Array(pointCountPerLine * 3 * lineCount)
		const colors = new Float32Array(pointCountPerLine * 3 * lineCount)
		const normals = new Float32Array(pointCountPerLine * 3 * lineCount)
		const indices = new Uint8Array((pointCountPerLine - 1) * 3 * 2 * (lineCount - 1))
		// initialize vertices
		lines.forEach((lines, i) => {
			const start = i * pointCountPerLine
			lines.points.forEach((point, j) => {
				const vi = (start + j) * 3
				vertices[vi + 0] = point.vec[0]
				vertices[vi + 1] = point.vec[1]
				vertices[vi + 2] = point.vec[2]
				colors[vi + 0] = lines.color[0]
				colors[vi + 1] = lines.color[1]
				colors[vi + 2] = lines.color[2]
				normals[vi + 0] = 0.0
				normals[vi + 1] = 0.0
				normals[vi + 2] = 1.0
			})
		})

		// set indices for every two line
		let lineIndex = 0
		let startIndex = 0
		while (lineIndex < lineCount - 1) {
			let i = 0
			while (i < pointCountPerLine - 1) {
				const i0 = lineIndex * pointCountPerLine + i
				const i1 = i0 + pointCountPerLine
				// link two triangle to form a rectangle
				// i0+1 -- i1+1
				//    | // |
				//   i0 -- i1
				indices[startIndex++] = i0
				indices[startIndex++] = i1
				indices[startIndex++] = i1 + 1
				indices[startIndex++] = i0
				indices[startIndex++] = i1 + 1
				indices[startIndex++] = i0 + 1
				i++
			}
			lineIndex++
		}

		const model3D: Model3D = {
			vertices,
			colors,
			normals,
			indices,
			totalSize: 0,
		}
		return model3D
	}

	static toCatmullRomSplines(points: Point3D[]) {
		if (points.length < 3) return points
		const points_ = [points[0], ...points, points[points.length - 1]]
		// TODO: 如何选择合适的插值数量？换言之 t 的值应该如何确定？
		const interpolationCount: number = 3
		const interpolatedPoints = pipe(
			// 取第 1 个到第 n-2 个点进行插值
			range(1, points_.length - 2),
			map((index) =>
				pipe(
					range(0, interpolationCount + 1),
					map((value) => value / (interpolationCount + 1)),
					// 插入 interpolationCount 个点，其中 t 属于 [0, 1)
					map((t) => {
						const v = lerpN(
							5,
							[
								points_[index - 1].toValues(),
								points_[index + 0].toValues(),
								points_[index + 1].toValues(),
								points_[index + 2].toValues(),
							],
							t,
						)
						return v
					}),
				),
			),
			flatMap((_) => _ as any),
			map(Point3D.fromValues),
		)

		return [...interpolatedPoints, points[points.length - 1]]
	}

	static offsetPoints(points: Point3D[], offset: number) {
		const line2d = points.map((p) => {
			const values = p.toValues()
			return vec2.fromValues(values[0], values[1])
		})
		const offsetedLine = offsetLine(line2d, offset)
		const offsetedPoints = points.map((p, i) => {
			return Point3D.fromValues([offsetedLine[i][0], offsetedLine[i][1], p.vec[2], p.force, p.time])
		})
		return offsetedPoints
	}

	static translatePointsByForce(points: Point3D[]) {
		const translations: vec3[] = points.map((p) => vec3.fromValues(0.0, 0.0, -p.force))
		const offsetedPoints = points.map((p, i) => {
			const v = translations[i]
			const newVec = vec3.add(vec3.create(), p.vec, v)
			return Point3D.fromValues([newVec[0], newVec[1], newVec[2], p.force, p.time])
		})
		return offsetedPoints
	}

	static fromPolyLines2D(polylines2d: Point2D[], options: PolyLines3DOptions) {
		const points = polylines2d.map(Point3D.fromPoint2D)
		return new PolyLines3D(points, options)
	}
}
