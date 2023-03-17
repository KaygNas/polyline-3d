import { Point2D } from '../catmull-rom-splines/point2d'
import { Model3D } from './line-drawer3d'
import { Point3D, PolyLines3D } from './polylines3d'

export const polylines = PolyLines3D.fromPolyLines2D(
	[
		// the outline of number 1
		[0.0, 0.0, 1.0, 100],
		[0.0, 1.0, 2.0, 100],
		[1.0, 1.0, 3.0, 100],
		[1.0, 6.0, 4.0, 100],
		[0.0, 6.0, 5.0, 100],
		[0.0, 7.0, 4.0, 100],
		[1.0, 8.0, 3.0, 100],
		[2.0, 8.0, 2.0, 100],
		[2.0, 1.0, 1.0, 100],
		[3.0, 1.0, 2.0, 100],
		[3.0, 0.0, 3.0, 100],
		[0.0, 0.0, 1.0, 100],
	].map((values) => Point2D.fromValues(values as any)),
	{ lineWidth: 0.5 },
)

export const squarePlain: Model3D = {
	vertices: new Float32Array([
		// Vertex coordinates
		1.0,
		1.0,
		1.0,
		-1.0,
		1.0,
		1.0,
		-1.0,
		-1.0,
		1.0,
		1.0,
		-1.0,
		1.0, // v0-v1-v2-v3 front
	]),
	colors: new Float32Array([
		// Colors
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0, // v0-v1-v2-v3 front(white)
	]),
	normals: new Float32Array([
		// Normal
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0, // v0-v1-v2-v3 front
	]),
	// Indices of the vertices
	indices: new Uint8Array([
		// Indices of the vertices
		0,
		1,
		2,
		0,
		2,
		3, // front
	]),
	totalSize: 0,
}
