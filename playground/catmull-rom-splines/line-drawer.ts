import { pipe } from 'fp-ts/lib/function'
import { flatMap, map, range } from 'lodash/fp'
import { lerpN } from './catmull-rom-splines'
import { Point2D } from './point2d'

export type Matrix = [number, number, number, number, number, number]
export interface Options {
	lineWidth?: number
	lineStyle?: string | CanvasGradient | CanvasPattern
	lineCap?: CanvasLineCap
	transform?: Matrix
}

export class LineDrawer {
	lineWidth: number = 1
	lineStyle: string | CanvasGradient | CanvasPattern = 'black'
	lineCap: CanvasLineCap = 'butt'
	transform: Matrix = [1, 0, 0, 1, 0, 0]

	canvasElement: HTMLCanvasElement
	canvasContext: CanvasRenderingContext2D

	constructor(canvasElement: HTMLCanvasElement, options: Options) {
		this.canvasElement = canvasElement
		this.canvasContext = canvasElement.getContext('2d')!
		this.setOption(options)
	}

	async drawCatmullRomSpline(points: Point2D[], { animate }: { animate: boolean }) {
		if (points.length < 3) return this.drawPolygon(points)
		const points_ = [points[0], ...points, points[points.length - 1]]
		// TODO: 如何选择合适的插值数量？换言之 t 的值应该如何确定？
		const interpolationCount = 20
		const interpolatedPoints = pipe(
			// 取第 1 个到第 n-2 个点进行插值
			range(1, points_.length - 2),
			map((index) =>
				pipe(
					range(0, interpolationCount).concat([interpolationCount]),
					map((value) => value / interpolationCount),
					// 插入 interpolationCount 个点，其中 t 属于 [0, 1]
					map((t) =>
						lerpN(
							4,
							{
								p0: points_[index - 1].toValues(),
								p1: points_[index].toValues(),
								p2: points_[index + 1].toValues(),
								p3: points_[index + 2].toValues(),
							},
							t,
						),
					),
				),
			),
			flatMap((_) => _ as any),
			map(Point2D.fromValues),
		)

		return new Promise<void>((resolve, reject) => {
			// 记录当前的时间戳
			// 取出当前时间戳之前的所有点并绘制他们
			// 截取剩余的点执行下一次动画
			let startTime: number
			let startIndex: number = 0
			const drawCatmullRomSpline_: FrameRequestCallback = (time: number) => {
				if (startIndex > interpolatedPoints.length - 1) return resolve()
				if (!startTime) startTime = time

				const relativeTime = time - startTime
				const endIndex_ = interpolatedPoints.findIndex((dot) => dot.time > relativeTime)
				const endIndex = endIndex_ === -1 ? Infinity : endIndex_
				const points_ = interpolatedPoints.slice(startIndex, endIndex + 1)
				startIndex = endIndex

				this.drawPolygon(points_)
				requestAnimationFrame(drawCatmullRomSpline_)
			}

			if (animate) {
				requestAnimationFrame(drawCatmullRomSpline_)
			} else {
				drawCatmullRomSpline_(Infinity)
				resolve()
			}
		})
	}

	async drawPolygon(points: Point2D[]) {
		if (points.length === 0) return

		const { canvasContext } = this
		const startPoint = points[0]
		canvasContext.lineWidth = startPoint.force * this.lineWidth
		canvasContext.strokeStyle = this.lineStyle + (startPoint.force * 255).toString(16)
		canvasContext.beginPath()
		canvasContext.moveTo(...startPoint.vec)
		for (let index = 1; index < points.length; index++) {
			canvasContext.lineTo(...points[index].vec)
		}
		canvasContext.stroke()
		this.setOption({})
	}

	draw(start: Point2D, end: Point2D) {
		const { canvasContext } = this
		canvasContext.moveTo(...start.vec)
		canvasContext.lineTo(...end.vec)
		canvasContext.stroke()
	}
	setOption(options: Options) {
		const { canvasContext } = this
		canvasContext.lineCap = options.lineCap ?? this.lineCap
		canvasContext.strokeStyle = options.lineStyle ?? this.lineStyle
		canvasContext.lineWidth = options.lineWidth ?? this.lineWidth
		canvasContext.setTransform(...(options.transform ?? this.transform))
		Object.assign(this, options)
	}
}
