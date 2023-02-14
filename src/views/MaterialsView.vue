<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import DoorBaseColor from "/src/assets/textures/door/Door_Wood_001_basecolor.jpg";
import DoorAmbientOcclusion from "/src/assets/textures/door/Door_Wood_001_ambientOcclusion.jpg";
import DoorHeight from "/src/assets/textures/door/Door_Wood_001_height.png";
import DoorMetallic from "/src/assets/textures/door/Door_Wood_001_metallic.jpg";
import DoorNormal from "/src/assets/textures/door/Door_Wood_001_normal.jpg";
import DoorOpacity from "/src/assets/textures/door/Door_Wood_001_opacity.jpg";
import DoorRoughness from "/src/assets/textures/door/Door_Wood_001_roughness.jpg";
import MatcapTexture from "/src/assets/textures/matcaps/1.png";
import GradientTexture from "/src/assets/textures/gradients/3.jpg";
import EnvMapPx from "/src/assets/textures/environmentMaps/1/px.jpg";
import EnvMapNx from "/src/assets/textures/environmentMaps/1/nx.jpg";
import EnvMapPy from "/src/assets/textures/environmentMaps/1/py.jpg";
import EnvMapNy from "/src/assets/textures/environmentMaps/1/ny.jpg";
import EnvMapPz from "/src/assets/textures/environmentMaps/1/pz.jpg";
import EnvMapNz from "/src/assets/textures/environmentMaps/1/nz.jpg";

/**
 Loading
*/
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("start");
};
loadingManager.onProgress = (_, loaded, total) => {
  console.log("prgoress", { loaded, total });
};
loadingManager.onLoad = () => {
  console.log("loaded");
};

/**
 Texture, (first is just js way, then three way)
*/
const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

const colorTexture = textureLoader.load(DoorBaseColor);
const ambientTexture = textureLoader.load(DoorAmbientOcclusion);
const heightTexture = textureLoader.load(DoorHeight);
const metallicTexture = textureLoader.load(DoorMetallic);
const normalTexture = textureLoader.load(DoorNormal);
const opacityTexture = textureLoader.load(DoorOpacity);
const roughnessTexture = textureLoader.load(DoorRoughness);
const matcapTexture = textureLoader.load(MatcapTexture);
const gradientTexture = textureLoader.load(GradientTexture);

const environmentMapTexture = cubeTextureLoader.load([
  EnvMapPx,
  EnvMapNx,
  EnvMapPy,
  EnvMapNy,
  EnvMapPz,
  EnvMapNz,
]);

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

const parameters = {
  color: 0xff0000,
};

// Scene
const scene = new THREE.Scene();

// Lights
const ambientLight = new THREE.AmbientLight("white", 0.5);
const pointLight = new THREE.PointLight("white", 0.5);
pointLight.position.set(2, 3, 4);

scene.add(ambientLight, pointLight);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Objects
// const material = new THREE.MeshBasicMaterial({ map: opacityTexture });
// const material = new THREE.MeshBasicMaterial();
// material.transparent = true;
// material.map = colorTexture;
// material.alphaMap = opacityTexture;
// material.side = THREE.DoubleSide; // Aby som objekt videl aj z druhej strany (less performance)
// material.color.set("red");
// material.opacity = 0.5;
// const material = new THREE.MeshNormalMaterial(); // pouzivane hlavne na debug normalov, (asi na tiene atd)
// material.flatShading = true;

// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// const material = new THREE.MeshDepthMaterial(); // na tento material nefunguju svetla
// const material = new THREE.MeshLambertMaterial(); // simplest material ktory reaguje na svetlo, good performance but weird glitches
// const material = new THREE.MeshPhongMaterial(); // odraza svetlo a je menej performanced
// material.shininess = 100;
// material.specular = new THREE.Color("red"); // farba "odrazu"
// const material = new THREE.MeshToonMaterial();
// gradientTexture.minFilter = THREE.NearestFilter;
// gradientTexture.magFilter = THREE.NearestFilter;
// gradientTexture.generateMipmaps = false;
// material.gradientMap = gradientTexture;

// const material = new THREE.MeshStandardMaterial();
// material.map = colorTexture;
// //ambient occlusion map
// material.aoMap = ambientTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = heightTexture;
// material.displacementScale = 0.05;
// material.metalness = 0.45;
// material.roughness = 0.65;
// material.metalnessMap = metallicTexture;
// material.roughnessMap = roughnessTexture;
// material.normalMap = normalTexture;
// material.transparent = true;
// material.alphaMap = opacityTexture;

const material = new THREE.MeshStandardMaterial();
material.metalness = 0.7;
material.roughness = 0.2;
material.envMap = environmentMapTexture;

gui.add(material, "metalness").min(0).max(2).step(0.001).name("Metalness:");
gui.add(material, "roughness", 0, 2, 0.001).name("Roughness:");
gui.add(material, "aoMapIntensity", 0, 4, 0.001);
gui.add(material, "displacementScale", 0, 1, 0.001);
gui.add(material.normalScale, "x", 0, 2, 0.001).name("NormalScale X:");
gui.add(material.normalScale, "y", 0, 2, 0.001).name("NormalScale Y:");

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
sphere.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
// threejs needs uv2 coordinates in order to place ambient occlusion on the texture
plane.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 64, 128), material);
torus.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

sphere.position.x = -1.5;
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

// Camera, fow and resolution (Aspect ratio)
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
camera.position.set(0, 0, 3);

const handleResize = () => {
  if (!camera || !renderer) return;
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  // controls.target.y = 1;
  // controls.update();

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    controls.update();

    const elapsedTime = clock.getElapsedTime();

    // sphere.rotation.y = 0.1 * elapsedTime;
    // plane.rotation.y = 0.1 * elapsedTime;
    // torus.rotation.y = 0.1 * elapsedTime;
    // sphere.rotation.x = 0.15 * elapsedTime;
    // plane.rotation.x = 0.15 * elapsedTime;
    // torus.rotation.x = 0.15 * elapsedTime;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
};

const onDoubleClick = () => {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  console.log("", "dbl click");
  if (!fullscreenElement) {
    if (canvas.value?.requestFullscreen) {
      // doesnt work in safari
      canvas.value?.requestFullscreen();
    } else if (canvas.value?.webkitRequestFullscreen) {
      canvas.value?.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
};

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
  gui.destroy();
});
</script>

<template>
  <div class="wrapper">
    <canvas ref="canvas" @dblclick="onDoubleClick" />
  </div>
</template>

<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
