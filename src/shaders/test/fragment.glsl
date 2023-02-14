// fragment sluzi na vyfarbovanie vertexov i guess :D
// SPUSTA SA PRE KAZDY JEDEN FRAGMENT
// je to nieco ako pixel daneho renderu, akurat ze to pixel nieje pretoze moze byt aj mimo obrazovky napr
// obrazovka vyfarbuje kazdy jeden pixel, shader vyfarbuje kazdy jeden fragment
// spusta sa po tom aku su hotove vertexy a GPU vie kde sa vertexy nachadzaju
// - nepouziva attributy len uniformy
// - alebo posleme varying z vertexu
// - hodnoty su interpolated, teda sa zmiesaju napr farby
//
precision mediump float;

// pouzivam uniform uColor z rawShaderu
uniform vec3 uColor;
// sampler2D je typ pre textury
uniform sampler2D uTexture;

// pouzivam attribut z vertexu
// varying float vRandom; 
varying vec2 vUv;
varying float vElevation;

void main() {
  // gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);
  // gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);

  vec4 textureColor = texture2D(uTexture, vUv);
  // kebyze napisem textureColor.xyz je to to iste, just syntatic sugar
  textureColor.rgb *= vElevation * 2.0 + 0.5;
  
  // gl_FragColor = vec4(uColor, 1.0);
  gl_FragColor = textureColor;
}