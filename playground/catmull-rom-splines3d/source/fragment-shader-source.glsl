precision mediump float;

uniform sampler2D u_Sampler;

uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform vec3 u_AmbientLight;
uniform vec3 u_LightPosition1;
uniform vec3 u_LightPosition2;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;

vec4 colorOfLight(vec3 lightPosition, vec3 vertexNormal, vec3 vectexPosition, vec4 vertexColor);

void main() {
  vec4 color1 = colorOfLight(u_LightPosition1, v_Normal, v_Position, v_Color);
  vec4 color2 = colorOfLight(u_LightPosition2, v_Normal, v_Position, v_Color);
  gl_FragColor = color1 + color2;
  // gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}

vec4 colorOfLight(vec3 lightPosition, vec3 vertexNormal, vec3 vectexPosition, vec4 vertexColor) {
  vec3 normal = normalize(vertexNormal);
  vec3 lightDirecion = normalize(lightPosition - vectexPosition);
  float nDotL = max(dot(lightDirecion, normal), 0.0);
  vec3 diffuse = u_LightColor * vec3(vertexColor) * nDotL;
  vec3 ambient = u_AmbientLight * vec3(vertexColor);
  vec4 color = vec4(diffuse + ambient, vertexColor.a);
  return color;
}