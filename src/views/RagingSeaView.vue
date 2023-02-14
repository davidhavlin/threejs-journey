<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import waterVertexShader from "/src/shaders/water/vertex.glsl";
import waterFragmentShader from "/src/shaders/water/fragment.glsl";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI({ width: 400 });
const debugObject = {
  depthColor: "#186691",
  surfaceColor: "#9bd8ff",
};

// Scene
const scene = new THREE.Scene();

const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

// const material = new THREE.ShaderMaterial({
//   vertexShader: testVertexShader,
//   fragmentShader: testFragmentShader,
//   side: THREE.DoubleSide,
// });
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uBigWavesSpeed: { value: 0.75 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
  },
});
// prettier-ignore
gui.add(waterMaterial.uniforms.uBigWavesSpeed, "value").min(0).max(4).step(0.001).name("uBigWavesSpeed");
// prettier-ignore
gui.add(waterMaterial.uniforms.uBigWavesElevation, "value").min(0).max(1).step(0.001).name("uBigWavesElevation");
// prettier-ignore
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, "x").min(0).max(10).step(0.001).name("uBigWavesFrequencyX");
// prettier-ignore
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, "y").min(0).max(10).step(0.001).name("uBigWavesFrequencyY");
// prettier-ignore
gui.add(waterMaterial.uniforms.uSmallWavesElevation, "value").min(0).max(1).step(0.001).name("uSmallWavesElevation");
// prettier-ignore
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, "value").min(0).max(30).step(0.001).name("uSmallWavesFrequency");
// prettier-ignore
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, "value").min(0).max(4).step(0.001).name("uSmallWavesSpeed");
// prettier-ignore
gui.add(waterMaterial.uniforms.uSmallIterations, "value").min(0).max(5).step(1).name("uSmallIterations");

// prettier-ignore
gui.addColor(debugObject, "depthColor").name('depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)})
// prettier-ignore
gui.addColor(debugObject, "surfaceColor").name('surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)})
// prettier-ignore
gui.add(waterMaterial.uniforms.uColorOffset, "value").min(0).max(1).step(0.001).name("uColorOffset");
// prettier-ignore
gui.add(waterMaterial.uniforms.uColorMultiplier, "value").min(0).max(10).step(0.001).name("uColorMultiplier");

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Camera, fow and resolution (Aspect ratio)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

const handleResize = () => {
  if (!camera || !renderer) return;
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
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

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // update water
    waterMaterial.uniforms.uTime.value = elapsedTime;

    // const deltaTime = elapsedTime - oldElapsedTime;
    // oldElapsedTime = elapsedTime;

    controls.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
};

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
  gui.destroy();
});
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
