<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

const canvas = ref<HTMLCanvasElement | null>(null);
const el = ref<HTMLElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Scene
const scene = new THREE.Scene();

// Groups
const groupCubes = new THREE.Group();
scene.add(groupCubes);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "green", wireframe: true })
);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

groupCubes.add(cube1);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera, fow and resolution (Aspect ratio)
let aspectRatio = sizes.width / sizes.height;
const originalAspectRatio = aspectRatio;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.1, 100);

// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 3;
camera.position.set(0, 0, 3);
scene.add(camera);
// gsap.to(camera.position, { z: 2, duration: 5, repeat: -1, yoyo: true });

const handleResize = () => {
  if (!camera || !renderer) return;
  setDimensions();

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  if (cube1) {
    const maxWidth = sizes.width < 300 ? sizes.width : 300;
    const width = Math.min(maxWidth * 0.003, sizes.height * 0.003 * aspectRatio); // Adjust as needed
    const height = width / originalAspectRatio;
    // cube1.scale.set(sizes.width * 0.001, sizes.height * 0.001, 1);
    // cube1.scale.set(sizes.width * 0.005, 1, 1);
    cube1.scale.set(width, height, 1);
  }
};

const listenForResize = () => {
  window.addEventListener("resize", handleResize);
};

function setDimensions() {
  if (!el.value) return;
  const { width, height } = el.value?.getBoundingClientRect() ?? {};
  sizes.width = width;
  sizes.height = height;
  aspectRatio = sizes.width / sizes.height;
}

// Renderer
const setRenderer = () => {
  if (!canvas.value) return;
  listenForResize();
  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  // controls.target.y = 1;
  // controls.update();

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value });
  handleResize();
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    // const currentTime = Date.now();
    // const deltaTime = currentTime - time;
    // time = currentTime;

    // const elapsedTime = clock.getElapsedTime();

    // camera.position.set(cursor.x * 3, cursor.y * 3, 3);
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y * 5;
    // camera.lookAt(new THREE.Vector3()); // same as (0,0,0)
    // camera.lookAt(cube1.position);

    controls.update();

    // More fps = faster rotation, thats why there is a solution with deltaTime/elapsedTime
    // groupCubes.rotation.y += 0.001 * deltaTime;
    // groupCubes.rotation.y = elapsedTime;
    // groupCubes.rotation.y = Math.sin(elapsedTime);
    // groupCubes.position.x = Math.cos(elapsedTime);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
};

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
});
</script>

<template>
  <div ref="el" class="wrapper">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 80%;
  height: 100%;
}
</style>
