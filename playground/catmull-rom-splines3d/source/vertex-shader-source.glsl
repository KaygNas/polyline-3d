attribute vec4 a_Position;
attribute float a_PointSize;
attribute vec4 a_Normal;
attribute vec4 a_Color;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_NormalMatrix;

attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;
varying vec4 v_Color;
varying vec3 v_Position;
varying vec3 v_Normal;

void main() {
  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
  v_Position = vec3(u_ModelMatrix * a_Position);

  v_Color = a_Color;
  v_TexCoord = a_TexCoord;

  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
  gl_PointSize = a_PointSize;
}