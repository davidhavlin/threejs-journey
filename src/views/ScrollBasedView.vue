<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  materialColor: "#ffeded",
  // spin: () => {
  // gsap.to(cube1.rotation, { y: cube1.rotation.y + 10, duration: 1 });
  // },
};

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/src/assets/textures/gradients/3.jpg");
// bez tohto threejs texturu ako keby rozmaze, nearestFilter proste pickne tu najblizsiu, ako keby vypneme
// gradient, mixovanie farieb
gradientTexture.magFilter = THREE.NearestFilter;

/** Objects */
// meshToonMaterial is light based material
const meshMaterial = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});
const objectsDistance = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), meshMaterial);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), meshMaterial);
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), meshMaterial);

mesh1.position.y = 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;
mesh1.position.x = 1;
mesh2.position.x = -1;
mesh3.position.x = 1;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/** Particles */
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  // Math.random() - 0.5, znormalizovanie, vycentrovanie
  positions[i * 3] = (Math.random() - 0.5) * 10; // x
  positions[i * 3 + 1] =
    objectsDistance * 0.4 - Math.random() * objectsDistance * sectionMeshes.length; // y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

gui.addColor(parameters, "materialColor").onChange(() => {
  meshMaterial.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/** Lights */
const directionalLight = new THREE.DirectionalLight("#fffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

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
const camera = new THREE.PerspectiveCamera(35, aspectRatio, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);
gui.add(camera.position, "y", -100, 100, 0.01).name("cameraY");

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
  listenForScroll();

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  startLoop(renderer);
};

let scrollY = window.scrollY;
let currentSection = 0;

const listenForScroll = () => {
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / sizes.height);

    if (newSection !== currentSection) {
      currentSection = newSection;
      gsap.to(sectionMeshes[currentSection].rotation, {
        x: "+=6",
        y: "+=3",
        z: "+=1.5",
        ease: "power2.inOut",
        duration: 1.5,
      });
    }
  });
};

let time = Date.now();
const clock = new THREE.Clock();
let previousTime = 0;

let currentIntersect: THREE.Intersection | null = null;

const startLoop = (renderer: THREE.WebGLRenderer) => {
  // const controls = new OrbitControls(camera, canvas.value);
  // controls.enableDamping = true;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate camera
    camera.position.y = (-scrollY / sizes.height) * objectsDistance;

    // const parallaxX = cursor.x * 0.5;
    // const parallaxY = -cursor.y * 0.5;

    // // Easing (Smoothing), faster on more fps screens, thats why we multiply by deltaTime
    // cameraGroup.position.x += ((parallaxX - cameraGroup.position.x) / 0.4) * deltaTime; // (/ 20) alebo (* 0.02)
    // cameraGroup.position.y += ((parallaxY - cameraGroup.position.y) / 0.4) * deltaTime; // cim vacsie cislo tym vacsi easing

    // Animate meshes
    for (const mesh of sectionMeshes) {
      // mesh.rotation.x = elapsedTime * 0.1;
      // mesh.rotation.y = elapsedTime * 0.12;
      // s elapsedTime by mi nefungovala func na riadku 153, preto pouzit deltatime
      mesh.rotation.x += deltaTime * 0.1;
      mesh.rotation.y += deltaTime * 0.12;
    }

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
    <section><h1>Test 1</h1></section>
    <section><h1>Test 2</h1></section>
    <section><h1>Test 3</h1></section>
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
.page section {
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  pointer-events: none;
}

.page section:nth-of-type(2) {
  justify-content: flex-end;
}

section h1 {
  font-size: 100px;
}
</style>
