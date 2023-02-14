<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

const canvas = ref<HTMLCanvasElement | null>(null);

// Scene
const scene = new THREE.Scene();

// Groups
const groupCubes = new THREE.Group();
scene.add(groupCubes);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "green" })
);

groupCubes.add(cube1);

// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "purple" });
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// Scale
mesh.scale.set(0.3, 1.5, 1);

// Rotate
mesh.rotation.reorder("YXZ");
// mesh.rotation.x = Math.PI * 0.25;
// mesh.rotation.y = Math.PI * 0.25;

// Axes helper (for positioning in space)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera, fow and resolution (Aspect ratio)
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.1, 100);

// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 3;
camera.position.set(0, 0, 3);
scene.add(camera);
// gsap.to(camera.position, { z: 2, duration: 5, repeat: -1, yoyo: true });

const cursor = {
  x: 0,
  y: 0,
};
const handleMouseMove = (e: MouseEvent) => {
  cursor.x = e.clientX / sizes.width - 0.5; // range from -0.5 to 0.5
  cursor.y = -(e.clientY / sizes.height - 0.5);
};

const listenForMouse = () => {
  window.addEventListener("mousemove", handleMouseMove);
};

// Renderer
const setRenderer = () => {
  if (!canvas.value) return;
  listenForMouse();
  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value });
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  startLoop(renderer);
};

let time = Date.now();
const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer) => {
  const tick = () => {
    // const currentTime = Date.now();
    // const deltaTime = currentTime - time;
    // time = currentTime;

    // const elapsedTime = clock.getElapsedTime();

    // camera.position.set(cursor.x * 3, cursor.y * 3, 3);
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    camera.position.y = cursor.y * 5;

    // camera.lookAt(new THREE.Vector3()); // same as (0,0,0)
    camera.lookAt(cube1.position);

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
  window.removeEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <div>
    <canvas ref="canvas" />
  </div>
</template>
