uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  
  // mix() zoberie jednu farbu(obe hodnoty nemusia byt farba ale float, vec2 atd) a druhu a zmixuje ich, 1.0 znamena ze ked druha hodnota bude 1 bude sa pouzivat ta
  // vec3 color = mix(uDepthColor, uSurfaceColor, 1.0);
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

  gl_FragColor = vec4(color, 1.0);
}