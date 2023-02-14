<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import testVertexShader from "/src/shaders/test/vertex.glsl";
import testFragmentShader from "/src/shaders/test/fragment.glsl";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load("/src/assets/textures/flag/flag-french.jpg");

// Debug
const gui = new dat.GUI({ width: 400 });
const debugObject = {};

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {
  materialColor: "#ffeded",
  // spin: () => {
  // gsap.to(cube1.rotation, { y: cube1.rotation.y + 10, duration: 1 });
  // },
};

const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

const count = geometry.attributes.position.count;
console.log("", { count });
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}

// tento attribut "aRandom" (a akoze attribute) mozem potom pouzit v vertex.glsl
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

/**
    Mozem pouzit THREE.ShaderMaterial a vo vertex.glsl mi automaticky
    appendne kod ako napr uniform mat4 projectionMatrix; je nativ
    RawShaderMaterial uz dalej nepouzivame, vyskusali sme si ho len aby
    sme videli co za premenne nam importuje ShaderMaterial
*/
const material = new THREE.RawShaderMaterial({
  // precision: 'lowp', // performance, def is mediump, nefunguje na RawShaderMaterial ale na ShaderMaterial
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // posielam uniformy do vertexu/fragmentu
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flagTexture },
  },
});

gui.add(material.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01).name("frequencyX");
gui.add(material.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01).name("frequencyY");

const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Camera, fow and resolution (Aspect ratio)
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(55, aspectRatio, 0.1, 100);
camera.position.z = 9;
camera.position.y = 2;
cameraGroup.add(camera);

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

    material.uniforms.uTime.value = elapsedTime;

    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

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
