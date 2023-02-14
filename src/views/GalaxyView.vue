<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI({ width: 400 });

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {
  countParticles: 50000,
  countPerVertex: 3, // values per vertex
  radius: 5,
  branches: 3,
  spin: 1,
  size: 0.01,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
  // spin: () => {
  // gsap.to(cube1.rotation, { y: cube1.rotation.y + 10, duration: 1 });
  // },
};

let geometry: THREE.BufferGeometry | null = null;
let material: THREE.PointsMaterial | null = null;
let points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;

const generateGalaxy = () => {
  if (points) {
    geometry?.dispose();
    material?.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.countParticles * parameters.countPerVertex);
  const colors = new Float32Array(parameters.countParticles * parameters.countPerVertex); // 3 because R, G, B

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.countParticles; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    // najlepsie pocitat vzdy od 0 po 1, preto si to vydelime / parameters.branches
    // const branchAngle = (i % parameters.branches) / parameters.branches ...
    // Math.PI je polka kruhu, * 2 mame cely kruh
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    const spinAngle = radius * parameters.spin;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    // positions[i3 + 1] = (Math.random() - 0.5) * 3; // y
    // positions[i3 + 2] = (Math.random() - 0.5) * 3; // z

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, parameters.countPerVertex)
  );
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, parameters.countPerVertex));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  points = new THREE.Points(geometry, material);

  scene.add(points);
};

generateGalaxy();

gui.add(parameters, "countParticles").min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius").min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, "branches").min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnessPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
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

let time = Date.now();
const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    controls.update();
    const elapsedTime = clock.getElapsedTime();
    // particles.rotation.x = elapsedTime * 0.1; // animujeme celok

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
