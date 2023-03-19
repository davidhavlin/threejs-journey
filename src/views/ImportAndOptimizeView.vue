<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import { Mesh, MeshBasicMaterial } from "three";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

//**
// Debug
const gui = new dat.GUI({
  width: 400,
});

// Canvas

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// BAKED TEXTURE
const bakedTexture = textureLoader.load("/src/assets/models/MyPortal/Baked.jpg");
bakedTexture.flipY = false;
bakedTexture.encoding = THREE.sRGBEncoding;
// BAKED MATERIAL
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

/**
 *  My Model
 */
gltfLoader.load("/src/assets/models/MyPortal/PortalOptimized.glb", (gltf) => {
  // v tomto pripade zbytocne traversujeme kedze portal sa zklada z 1 objektu
  gltf.scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = bakedMaterial;
    }
  });

  const poleLightMeshs = gltf.scene.children.filter((child) =>
    ["Cube013", "Cube018"].includes(child.name)
  ) as Mesh[];
  const portalLightMesh = gltf.scene.children.find((mesh) => mesh.name === "Circle") as Mesh;
  poleLightMeshs.forEach((pole) => {
    pole.material = poleLightMaterial;
  });
  portalLightMesh.material = portalLightMaterial;

  scene.add(gltf.scene);
});

/**
 * Lights
 */

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
const camera = new THREE.PerspectiveCamera(55, aspectRatio, 0.1, 100);
camera.position.z = 14;
camera.position.y = 6;
cameraGroup.add(camera);

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

  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  startLoop(renderer, controls);
};

const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    controls.update();

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
</style>
