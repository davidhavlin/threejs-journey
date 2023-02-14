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
const matcapTexture = textureLoader.load(MatcapTexture);

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
const ambientLight = new THREE.AmbientLight("white", 0.4);
const directionalLight = new THREE.DirectionalLight("blue", 0.3);
directionalLight.position.set(1, 0.55, 0);

const hemisphereLight = new THREE.HemisphereLight("purple", "orange", 0.5);

const pointLight = new THREE.PointLight("0xff9000", 0.5, 3);
pointLight.position.set(1, -0.9, 1);

const rectAreaLight = new THREE.RectAreaLight("green", 3, 1, 1); // works only with MeshStandardMaterial and MeshPhysicalMaterial
rectAreaLight.position.set(-1.5, -0.9, 1.5);
rectAreaLight.lookAt(new THREE.Vector3()); // look at center of the scene, default is 0,0,0

const spotLight = new THREE.SpotLight("orange", 0.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
// Rotating our SpotLight is a little harder. The instance has a property named target, which is an Object3D. The SpotLight is always looking at that target object. But if you try to change its position, the SpotLight won't budge:
// That is due to our target not being in the scene. Simply add the target to the scene, and it should work:
scene.add(spotLight.target);
spotLight.target.position.x = -0.75;

scene.add(ambientLight, directionalLight, hemisphereLight, pointLight, rectAreaLight, spotLight);
// Minimal performance cost [ AmbientLight, HemisphereLight ]
// Moderate performance cost [ DirectionalLight, PointLight ]
// High performance cost [ SpotLight, RectAreaLight ]

// Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

// only spotlight helper needs update in next frame, use requestAnimationFrame or nexttick
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
nextTick(() => {
  spotLightHelper.update();
});

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Objects

const material = new THREE.MeshStandardMaterial();

const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
cube.position.x = 0.75;
sphere.position.x = -0.75;
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -1;
scene.add(cube, sphere, plane);

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
