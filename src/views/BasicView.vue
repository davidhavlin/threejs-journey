<script setup lang="ts">
import * as THREE from "three";
import { onMounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);

// Scene
const scene = new THREE.Scene();

// Groups
const groupCubes = new THREE.Group();
scene.add(groupCubes);

groupCubes.rotation.y = 0.5;
groupCubes.rotation.z = 0.5;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "green" })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.2, 0.5),
  new THREE.MeshBasicMaterial({ color: "orange" })
);
cube2.position.set(1.5, 0, 0.5);
const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 1.2, 0.3),
  new THREE.MeshBasicMaterial({ color: "blue" })
);
cube3.position.set(-2, 0, 0);

groupCubes.add(cube1);
groupCubes.add(cube2);
groupCubes.add(cube3);

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 3;
camera.position.set(0, 0, 3);
scene.add(camera);
camera.lookAt(cube1.position);

// Renderer
const setRenderer = () => {
  if (!canvas.value) return;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value });
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
};

onMounted(setRenderer);
</script>

<template>
  <div>
    <canvas ref="canvas" />
  </div>
</template>
