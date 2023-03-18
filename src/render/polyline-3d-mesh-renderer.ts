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
  private projMat = mat4.ortho(mat4.create(), -10, 10, -10, 10, -100, 100)

  private lightColor = vec3.fromValues(1.0, 0.0, 0.0)
  private lightPosition = vec3.fromValues(0.0, 0.0, 20.0)
  private ambientLight = vec3.fromValues(0.0, 0.0, 0.4)

  private meshs = new Set<MeshModel>()

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
        u_LightColor: { type: SchemaTypes.vec3, default: this.lightColor },
        u_AmbientLight: { type: SchemaTypes.vec3, default: this.ambientLight },
        u_LightPosition: { type: SchemaTypes.vec3, default: this.lightPosition },
        u_ViewMatrix: { type: SchemaTypes.mat4, default: this.viewMat },
        u_ProjMatrix: { type: SchemaTypes.mat4, default: this.projMat },
        u_ModelMatrix: { type: SchemaTypes.mat4, default: this.modelMat },
      },
    })
    const gl = this.beam.gl
    gl.enable(gl.DEPTH_TEST)
    this.enableRotationControl()
  }

  addMesh(mesh: MeshModel | MeshModel[]) {
    const _meshs = Array.isArray(mesh) ? mesh : [mesh]
    _meshs.forEach(mesh => this.meshs.add(mesh))
  }

  render() {
    this.meshs.forEach(mesh => this.renderMesh(mesh))
  }

  private renderMesh(mesh: MeshModel) {
    const {
      beam, shader,
      eye, center, up,
      viewMat, modelMat, projMat,
      lightColor, lightPosition, ambientLight,
    } = this
    const { positions, colors, normals, indices } = mesh

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
        u_LightColor: lightColor,
        u_AmbientLight: ambientLight,
        u_LightPosition: lightPosition,
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
