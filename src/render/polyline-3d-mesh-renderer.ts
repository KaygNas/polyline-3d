import { mat4, vec3 } from 'gl-matrix'
import type { Shader } from 'beam-gl'
import { Beam, ResourceTypes, SchemaTypes } from 'beam-gl'
import VERTEX_SHADER from './shaders/vertex-shader.glsl'
import FRAGMENT_SHADER from './shaders/fragment-shader.glsl'
import type { MeshModel } from './interface'

export class Polyline3DMeshRenderer {
  private beam: Beam
  private shader: Shader
  private meshs = new Set<MeshModel>()

  viewMat = mat4.create()
  eye = vec3.fromValues(0, 0, 1)
  center = vec3.fromValues(0.0, 0.0, 0.0)
  up = vec3.fromValues(0.0, 1.0, 0.0)
  modelMat = mat4.create()
  projMat = mat4.ortho(mat4.create(), -1, 1, -1, 1, 0, 2)

  lightColor = vec3.fromValues(1.0, 1.0, 1.0)
  lightPosition = vec3.fromValues(0.0, 0.0, 1.0)
  ambientLight = vec3.fromValues(0.4, 0.4, 0.4)

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
}
