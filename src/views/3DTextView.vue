<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import MatcapTexture from "/src/assets/textures/matcaps/3.png";

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

const fontLoader = new FontLoader(loadingManager);

fontLoader.load("/src/assets/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Hello three.js!", {
    font,
    size: 0.5,
    height: 0.1,
    curveSegments: 5, // lowest as possible
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4, // lowest as possible
  });
  // textGeometry.computeBoundingBox();
  // console.log("", textGeometry.boundingBox);
  // textGeometry.translate(
  //   -(textGeometry.boundingBox?.max.x! - 0.02) * 0.5,
  //   -(textGeometry.boundingBox?.max.y! - 0.02) * 0.5,
  //   -(textGeometry.boundingBox?.max.z! - 0.03) * 0.5
  // );
  textGeometry.center();
  const matcapMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  const text = new THREE.Mesh(textGeometry, matcapMaterial);
  scene.add(text);
  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 40);

  for (let i = 0; i < 100; i++) {
    const donut = new THREE.Mesh(donutGeometry, matcapMaterial);
    donut.position.x = (Math.random() - 0.5) * 10;
    donut.position.y = (Math.random() - 0.5) * 10;
    donut.position.z = (Math.random() - 0.5) * 10;

    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    const scale = Math.max(0.3, Math.random());
    donut.scale.set(scale, scale, scale);

    scene.add(donut);
  }
});

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
// const ambientLight = new THREE.AmbientLight("white", 0.5);
// const pointLight = new THREE.PointLight("white", 0.5);
// pointLight.position.set(2, 3, 4);

// scene.add(ambientLight, pointLight);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Objects

const material = new THREE.MeshBasicMaterial();

const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
// scene.add(cube);

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
