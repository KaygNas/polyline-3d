import { RGBA } from './rgba'
import {
	getGl,
	GL,
	initIndicesBuffer,
	initShader,
	initTexture,
	initVertexBuffers,
	setLight,
	setMatrix,
} from './webgl-utils'
import { VSHADER_SOURCE, FSHADER_SOURCE } from './source'
import imageUrl from './assets/image.jpeg'
import { mat4, vec3 } from 'gl-matrix'

export interface Model3D {
	vertices: Float32Array
	colors: Float32Array
	normals: Float32Array
	indices: Uint8Array
	totalSize: number
}

export class LineDrawer3D {
	canvasElement: HTMLCanvasElement

	gl: GL

	viewMat = mat4.create()
	eye = vec3.fromValues(0, 0, 7)
	center = vec3.fromValues(0.0, 0.0, 0.0)
	up = vec3.fromValues(0.0, 1.0, 0.0)
	modelMat = mat4.create()
	projMat = mat4.ortho(mat4.create(), -10, 10, -10, 10, 1, 100)
	normalMat = mat4.create()

	model: Model3D = {
		vertices: new Float32Array(),
		colors: new Float32Array(),
		normals: new Float32Array(),
		indices: new Uint8Array(),
		totalSize: 0,
	}

	get n() {
		return this.model.indices.length
	}

	constructor(canvasElement: HTMLCanvasElement) {
		this.canvasElement = canvasElement
		this.gl = getGl(canvasElement)
		this.initGl()
		this.enableRotationControl()
	}

	bindModel3D(model: Model3D) {
		const { gl } = this
		this.model = model

		initVertexBuffers(gl, model.vertices, model.totalSize, [
			{ attributeName: 'a_Position', size: 3, offset: 0 },
		])
		initVertexBuffers(gl, model.colors, model.totalSize, [
			{ attributeName: 'a_Color', size: 3, offset: 0 },
		])
		initVertexBuffers(gl, model.normals, model.totalSize, [
			{ attributeName: 'a_Normal', size: 3, offset: 0 },
		])
		initIndicesBuffer(gl, model.indices)
	}

	initGl() {
		const { gl } = this
		gl.enable(gl.DEPTH_TEST)
		initShader(gl, VSHADER_SOURCE, FSHADER_SOURCE)
		setLight(gl, [
			{ uniformName: 'u_LightColor', vector: vec3.fromValues(0.4, 0.4, 0.4) },
			{ uniformName: 'u_LightDirection', vector: vec3.fromValues(0.5, 3.0, 4.0), normalize: true },
			{ uniformName: 'u_AmbientLight', vector: vec3.fromValues(0.2, 0.2, 0.2) },
			{ uniformName: 'u_LightPosition1', vector: vec3.fromValues(0.0, 0.0, 10.0) },
			{ uniformName: 'u_LightPosition2', vector: vec3.fromValues(10.0, 10.0, 10.0) },
		])
	}

	enableRotationControl() {
		document.onkeydown = (e) => {
			const { modelMat } = this
			const tranformMat = mat4.create()
			switch (e.key) {
				case 'ArrowLeft':
					mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(0.0, 1.0, 0.0))
					break
				case 'ArrowRight':
					mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(0.0, 1.0, 0.0))
					break
				case 'ArrowUp':
					mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(1.0, 0.0, 0.0))
					break
				case 'ArrowDown':
					mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(1.0, 0.0, 0.0))
					break
				default:
			}
			mat4.multiply(modelMat, modelMat, tranformMat)
			this.draw()
		}
	}

	draw() {
		const { gl, viewMat, eye, center, up, modelMat, projMat, normalMat, n } = this

		mat4.lookAt(viewMat, eye, center, up)
		mat4.invert(normalMat, modelMat)
		mat4.transpose(normalMat, normalMat)

		setMatrix(gl, 'u_NormalMatrix', normalMat)
		setMatrix(gl, 'u_ViewMatrix', viewMat)
		setMatrix(gl, 'u_ProjMatrix', projMat)
		setMatrix(gl, 'u_ModelMatrix', modelMat)

		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
	}

	/** 清空画布为指定颜色 */
	clear(color: RGBA) {
		this.gl.clearColor(...color.value)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}
}
