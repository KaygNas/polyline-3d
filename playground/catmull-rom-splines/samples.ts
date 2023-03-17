import rawData from './raw-data.json'
import { Point2D } from './point2d'

export type Stroke = Point2D[]

const nomalizeData = (raw: typeof rawData): Stroke[] => {
	return raw.dot_strokes.map<Stroke>((dot) => {
		return dot.x.map<Point2D>((x, i) => {
			return new Point2D(
				[x, dot.y[i]],
				dot.force[i] / 60,
				i > 0 ? dot.relative_time[i] - dot.relative_time[i - 1] : 0,
			)
		})
	})
}
export const samples = nomalizeData(rawData)

export const samples2 = [
	[0, 100, 1, 100],
	[20, 120, 0.5, 1300],
	[40, 80, 0.01, 1800],
	[60, 120, 0.5, 2500],
	[80, 80, 1, 3000],
	[100, 120, 0.5, 3700],
	[160, 60, 0.2, 4800],
	[220, 160, 0.01, 4900],
].map<Point2D>((values) => {
	return Point2D.fromValues(values as any)
})
