import { mat4, vec3 } from 'gl-matrix'
import type { Shader } from 'beam-gl'
import { Beam, ResourceTypes, SchemaTypes } from 'beam-gl'
import VERTEX_SHADER from './shaders/vertex-shader.glsl'
import FRAGMENT_SHADER from './shaders/fragment-shader.glsl'
import type { MeshModel } from './interface'

export class Polyline3DMeshRenderer {
  private beam: Beam
  private shader: Shader

  private viewMat = mat4.create()
  private eye = vec3.fromValues(-3, 3, 7)
  private center = vec3.fromValues(0.0, 0.0, 0.0)
  private up = vec3.fromValues(0.0, 1.0, 0.0)
  private modelMat = mat4.create()
  private projMat = mat4.ortho(mat4.create(), -10, 10, -10, 10, 1, 100)
  private mesh: MeshModel = {
    indices: new Uint16Array(),
    positions: new Float32Array(),
    colors: new Float32Array(),
    normals: new Float32Array(),
  }

  constructor(canvasElement: HTMLCanvasElement) {
    this.beam = new Beam(canvasElement)
    this.shader = this.beam.shader({
      fs: FRAGMENT_SHADER,
      vs: VERTEX_SHADER,
      buffers: {
        a_Position: { type: SchemaTypes.vec4 },
        a_Color: { type: SchemaTypes.vec4 },
        a_Normal: { type: SchemaTypes.vec4 },
      },
      uniforms: {
        u_LightColor: { type: SchemaTypes.vec3, default: vec3.fromValues(1, 1, 1) },
        u_AmbientLight: { type: SchemaTypes.vec3, default: vec3.fromValues(0.6, 0.6, 0.6) },
        u_LightPosition: { type: SchemaTypes.vec3, default: vec3.fromValues(-3.0, 7.0, 8.0) },
        u_ViewMatrix: { type: SchemaTypes.mat4, default: this.viewMat },
        u_ProjMatrix: { type: SchemaTypes.mat4, default: this.projMat },
        u_ModelMatrix: { type: SchemaTypes.mat4, default: this.modelMat },
      },
    })
    const gl = this.beam.gl
    gl.enable(gl.DEPTH_TEST)
    this.enableRotationControl()
  }

  render(mesh: MeshModel = this.mesh) {
    const { viewMat, eye, center, up, modelMat, projMat, beam, shader } = this
    const { positions, colors, normals, indices } = (this.mesh = mesh)

    mat4.lookAt(viewMat, eye, center, up)
    beam.draw(
      shader,
      beam.resource(ResourceTypes.VertexBuffers, {
        a_Position: positions,
        a_Color: colors,
        a_Normal: normals,
      }),
      beam.resource(ResourceTypes.IndexBuffer, { array: indices }),
      beam.resource(ResourceTypes.Uniforms, {
        u_ModelMatrix: modelMat,
        u_ViewMatrix: viewMat,
        u_ProjMatrix: projMat,
      }),
    )
  }

  private enableRotationControl() {
    const onkeydown = (e: KeyboardEvent) => {
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
      this.render()
    }
    window.addEventListener('keydown', onkeydown)
  }
}
