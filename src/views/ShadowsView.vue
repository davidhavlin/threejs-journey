<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import MatcapTexture from "/src/assets/textures/matcaps/3.png";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

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

// Scene
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader(loadingManager);
const bakedShadow = textureLoader.load("/src/assets/textures/shadows/bakedShadow.jpg");
const simpleShadow = textureLoader.load("/src/assets/textures/shadows/simpleShadow.jpg");

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

const parameters = {
  color: 0xff0000,
};

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// Lights
const ambientLight = new THREE.AmbientLight("white", 0.3);
const directionalLight = new THREE.DirectionalLight("blue", 0.3);
directionalLight.position.set(2, 1.55, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 5;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 1;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -1;
directionalLight.shadow.radius = 10;

const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 2;
spotLight.shadow.camera.far = 5;
spotLight.castShadow = true;
spotLight.position.set(0, 2, 2);

// pointlight robi render do kazdej strany a posledny je spodny, preto kamera ukazuje ten posledny
const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;
pointLight.position.set(-1, 1, 0);

scene.add(ambientLight, directionalLight, spotLight, pointLight);
scene.add(spotLight.target);
// Minimal performance cost [ AmbientLight, HemisphereLight ]
// Moderate performance cost [ DirectionalLight, PointLight ]
// High performance cost [ SpotLight, RectAreaLight ]
// Supports shadows [ PointLight, DirectionalLight, SpotLight ]

// Helpers

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
directionalLightCameraHelper.visible = false;
spotLightCameraHelper.visible = false;
scene.add(
  directionalLightHelper,
  directionalLightCameraHelper,
  spotLightCameraHelper,
  pointLightCameraHelper
);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Objects

const material = new THREE.MeshStandardMaterial();

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
sphere.castShadow = true;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.receiveShadow = true;
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -0.5;

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x00000,
    transparent: true,
    alphaMap: simpleShadow,
  })
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.001;
// Static baked shadow
// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(5, 5),
//   new THREE.MeshBasicMaterial({ map: bakedShadow })
// );

scene.add(sphere, sphereShadow, plane);

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

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    controls.update();

    const elapsedTime = clock.getElapsedTime();

    sphere.position.x = Math.cos(elapsedTime) * 1.5;
    sphere.position.z = Math.sin(elapsedTime) * 1.5;
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 2));

    //update the shadow
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.5;

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

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
  gui.destroy();
});
</script>

<template>
  <div class="wrapper">
    <canvas ref="canvas" />
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
