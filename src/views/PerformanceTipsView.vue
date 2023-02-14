<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Canvas
const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();

/**
 * Test meshes
 */
const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial());
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(-5, 0, 0);
scene.add(cube);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
  new THREE.MeshStandardMaterial()
);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial()
);
sphere.position.set(5, 0, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial());
floor.position.set(0, -2, 0);
floor.rotation.x = -Math.PI * 0.5;
floor.castShadow = true;
floor.receiveShadow = true;
scene.add(floor);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, 2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 2, 6);
scene.add(camera);

const handleResize = () => {
  if (!camera || !renderer) return;
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

const cursor = {
  x: 0,
  y: 0,
};

const handleMouseMove = (e: MouseEvent) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
};

const listenForResize = () => {
  window.addEventListener("resize", handleResize);
};

// Renderer
const setRenderer = () => {
  if (!canvas.value) return;
  listenForResize();

  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;

  // ZAPINAT ANTIALIS LEN PRE MONITORY S MENSIM PIXEL RATIOM AKO 2, pretoze tie to nepotrebuju
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding; // nefunguje ked renderujeme cez render target
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

/**
 * Animate
 */
const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
};

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
  gui.destroy();
});

/**
 * Tips
 */

// Tip 1
// open devtools, cmnd + shift + p, and type fps
// or use stats.js

// Tip 2
// disable fps limit in chrome and test website

// Tip 3
// install chrome extension called spector.js

// // Tip 4
// console.log(renderer.info)

// // Tip 6
// scene.remove(cube)
// cube.geometry.dispose()
// cube.material.dispose()

// // Tip 10 (optimalizaciaa tienov pomocou cameraHelperu)
// directionalLight.shadow.camera.top = 3
// directionalLight.shadow.camera.right = 6
// directionalLight.shadow.camera.left = - 6
// directionalLight.shadow.camera.bottom = - 3
// directionalLight.shadow.camera.far = 10
// directionalLight.shadow.mapSize.set(1024, 1024)

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(cameraHelper)

// // Tip 11
// cube.castShadow = true
// cube.receiveShadow = false

// torusKnot.castShadow = true
// torusKnot.receiveShadow = false

// sphere.castShadow = true
// sphere.receiveShadow = false

// floor.castShadow = false
// floor.receiveShadow = true

// // Tip 12
// renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate = true

// Tip 13
// pouzivat textury s co najmensim rozlisenim, velkost suboru nehra rolu

// Tip 14
// neanimovat geometry vertexy v tick funkcii, pouzivat na to vertex shadery

// // Tip 18
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5) // toto pouzivat mimo for loopy
// for(let i = 0; i < 50; i++)
// {

//     const material = new THREE.MeshNormalMaterial()

//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

// Tip 19 (Merge optimize geometries) aby ich vykreslilo naraz, (drawCall)
const geometries = [];
for (let i = 0; i < 50; i++) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

  geometry.rotateX((Math.random() - 0.5) * Math.PI * 2);
  geometry.rotateY((Math.random() - 0.5) * Math.PI * 2);

  geometry.translate(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  geometries.push(geometry);
}

const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
console.log(mergedGeometry);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);

// // Tip 20
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

// for(let i = 0; i < 50; i++)
// {
//     const material = new THREE.MeshNormalMaterial()

//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

// // Tip 22
// If you cannot merge the geometries because you need to have control over the meshes independently, but they are using the same geometry and same material, you can use an InstancedMesh.
// It's like a mesh, but you create only one InstancedMesh, and then you provide a transformation matrix for each "instance" of that mesh.
// The matrix has to be a Matrix4, and you can apply any transformation by using the various available methods:

// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

// const material = new THREE.MeshNormalMaterial()

// const mesh = new THREE.InstancedMesh(geometry, material, 50) // THIS
// mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
// scene.add(mesh)

// for(let i = 0; i < 50; i++)
// {
//     const position = new THREE.Vector3(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     )

//     const quaternion = new THREE.Quaternion()
//     quaternion.setFromEuler(new THREE.Euler((Math.random() - 0.5) * Math.PI * 2, (Math.random() - 0.5) * Math.PI * 2, 0))

//     const matrix = new THREE.Matrix4()
//     matrix.makeRotationFromQuaternion(quaternion)
//     matrix.setPosition(position)

//     mesh.setMatrixAt(i, matrix)
// }
// JavaScript
// We get a result almost as good as merge geometries, but we can still move the meshes by changing the matrices.
// If you intend to change these matrices in the tick function, add this to the InstancedMesh:

// // Tip 29
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// // Tip 31, 32, 34 and 35
// const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256)

// nepouzivat ify, pouzivat clamp()
// const shaderMaterial = new THREE.ShaderMaterial({
//     uniforms:
//     {
//         uDisplacementTexture: { value: displacementTexture },
//         uDisplacementStrength: { value: 1.5 }
//     },
//     vertexShader: `
//         uniform sampler2D uDisplacementTexture;
//         uniform float uDisplacementStrength;

//         varying vec2 vUv;

//         void main()
//         {
//             vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//             float elevation = texture2D(uDisplacementTexture, uv).r;
//             if(elevation < 0.5)
//             {
//                 elevation = 0.5;
//             }

//             modelPosition.y += elevation * uDisplacementStrength;

//             gl_Position = projectionMatrix * viewMatrix * modelPosition;

//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D uDisplacementTexture;

//         varying vec2 vUv;

//         void main()
//         {
//             float elevation = texture2D(uDisplacementTexture, vUv).r;
//             if(elevation < 0.25) // BAD, use clamp()
//             {
//                 elevation = 0.25;
//             }

//             vec3 depthColor = vec3(1.0, 0.1, 0.1);
//             vec3 surfaceColor = vec3(0.1, 0.0, 0.5);

// bad
//             // vec3 finalColor = vec3(0.0);
//             // finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
//             // finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
//             // finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;

// vec3 finalColor = mix(depthColor, surfaceColor, elevation); // goood

//             gl_FragColor = vec4(finalColor, 1.0);
//         }
//     `
// })

// const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
// shaderMesh.rotation.x = - Math.PI * 0.5
// scene.add(shaderMesh)

// Tip 36
// pouzivat v shaderoch #define, (akoze constanty)
// #define uDisplacementStrength 1.5

// Tip 37
// robit kalkulacie vo vertex shaderu a nie vo fragmentu, tam si ho posleme pomocou varying, stratia sa niektore detaily kedze vertexov je menej ako fragmentov
</script>

<template>
  <div class="page">
    <div class="wrapper" @mousemove="handleMouseMove">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
.page .wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
