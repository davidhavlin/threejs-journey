<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

const parameters = {
  color: 0xff0000,
  spin: () => {
    // gsap.to(cube1.rotation, { y: cube1.rotation.y + 10, duration: 1 });
  },
};

// Scene
const scene = new THREE.Scene();

// Textures
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/src/assets/textures/particles/2.png");

// Particles
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
const particlesGeometry = new THREE.BufferGeometry();
const COUNT_OF_PARTICLES = 5000;
const COUNT_OF_VALUE_VERTEX = 3;

const positions = new Float32Array(COUNT_OF_PARTICLES * COUNT_OF_VALUE_VERTEX); // [x,y,z, x,y,z..]
const colors = new Float32Array(COUNT_OF_PARTICLES * COUNT_OF_VALUE_VERTEX); // [r,g,b,  r,g,b..]

for (let i = 0; i < COUNT_OF_PARTICLES * COUNT_OF_VALUE_VERTEX; i++) {
  positions[i] = (Math.random() - 0.5) * 10; // math.random -0.5 spravi nieco ako vycentrovanie
  colors[i] = Math.random();
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, COUNT_OF_VALUE_VERTEX)
);
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, COUNT_OF_VALUE_VERTEX));

//sizeAttenuation particles co su dalej od kamery su mensie, proste prida perspektivu
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  // color: "#ff88cc", // impactuje farby ktore setneme cez vertex
  vertexColors: true, // na to aby fungovali rozne farby particlov
  transparent: true,
  alphaMap: particleTexture,
  // alphaTest: 0.001, // cierne pixely v texture nebudu rendernute
  // depthTest: false, // fixne problem ale nie pokial mame v scene viac objektov (alebo particles roznych farieb), ale cool effekt
  depthWrite: false, // fixlo problem aj s viac objektami, mozu sa vyskytnut bugy
  blending: THREE.AdditiveBlending, // nieco ako mix-blend, impactuje performance
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

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

    for (let i = 0; i < COUNT_OF_PARTICLES; i++) {
      const i3 = i * 3;
      // i3 = x
      // i3 + 1 = y
      // i3 +2 = z

      const xPosition = particlesGeometry.attributes.position.array[i3];

      particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + xPosition);
      // THIS IS A BAD WAY, NOT OPTIMIZED
      // BETTER TO USE CUSTOM SHADER
    }
    particlesGeometry.attributes.position.needsUpdate = true;

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
