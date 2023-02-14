// tento program sa spusta pre kazdy jeden vertex
// - Attributy: su rozdielne pre kazdy vertex
// - Uniforms: su iste pre kazdy vertex


// The modelMatrix will apply all transformations relative to the Mesh. If we scale, rotate or move the Mesh, these transformations will be contained in the modelMatrix and applied to the position.
// The viewMatrix will apply transformations relative to the camera. If we rotate the camera to the left, the vertices should be on the right. If we move the camera in direction of the Mesh, the vertices should get bigger, etc.
// The projectionMatrix will finally transform our coordinates into the final clip space coordinates.
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

//pouzivam uniform z raw shaderu riadok 48
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
// uv coordinates pre farbenie?
attribute vec2 uv;
// poslem koordinaty rovno do fragmentu
varying vec2 vUv;
varying float vElevation;

// attribute float aRandom;

// ked chcem poslat attribut do fragmentu
// varying float vRandom;

void main() {
  // s modelPosition robime vsetky mozne transformacie
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // spravi vlnenie
  float elevation = sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;

  // modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
  // modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;
  modelPosition.z += elevation;

  // modelPosition.z += aRandom * 0.1;

  // toto je skoro vzdy rovnake, dolezita je cast s modelPosition
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionMatrix = projectionMatrix * viewPosition;

  gl_Position = projectionMatrix;

  // vRandom = aRandom;
  vUv = uv;
  vElevation = elevation;
}