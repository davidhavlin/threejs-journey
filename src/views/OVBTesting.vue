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
const debugObject = {
  bgColor: "#F3F6FB",
};
const gui = new dat.GUI({
  width: 400,
});

const changeRendererBg = () => {
  renderer?.setClearColor(debugObject.bgColor);
};

gui.addColor(debugObject, "bgColor").onFinishChange(changeRendererBg);

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

const fog = new THREE.Fog("#F3F6FB", 1, 30);
scene.fog = fog;

/** Floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: "grey" })
);
floor.rotation.x = -0.5 * Math.PI;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const groupCubes = new THREE.Group();
scene.add(groupCubes);
groupCubes.position.x = -0.5;

// groupCubes.rotation.x = 2;
// groupCubes.rotation.z = 1;
// groupCubes.rotation.z = 0.5;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 2, 0.5),
  new THREE.MeshStandardMaterial({ color: "#B6C6E3" })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 3, 0.5),
  new THREE.MeshStandardMaterial({ color: "#56C5D7" })
);
// cube2.scale.set(1, 1, 2);
cube1.castShadow = true;
cube2.castShadow = true;
cube1.position.set(0, 1, 4);
cube1.rotation.set(0, 0.3, 0);
cube2.rotation.set(0, 0.3, 0);
cube2.position.set(0.9, 1, 4.3);
cube2.position.y += cube2.scale.y / 2;

groupCubes.add(cube1, cube2);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight("#ffffff", 1);
sunLight.castShadow = true;
sunLight.shadow.camera.far = 15;
sunLight.shadow.mapSize.set(1024, 1024); // quality of shadow, cim vacsie rozlisenie tym kvalitnejsie
sunLight.shadow.normalBias = 0.05;
sunLight.position.set(5, 4, 5);
scene.add(sunLight);
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
const directionalLightCameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
// directionalLightCameraHelper.visible = true;
// scene.add(directionalLightHelper, directionalLightCameraHelper);
scene.add(directionalLightCameraHelper);
// Camera Group
// const cameraGroup = new THREE.Group();
// scene.add(cameraGroup);

// Camera, fow and resolution (Aspect ratio)
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 100);
// const camera = new THREE.PerspectiveCamera(20, aspectRatio, 0.1, 100);
camera.position.set(0, 4, 14);
// cameraGroup.add(camera);

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

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
  });
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  changeRendererBg();

  startLoop(renderer, controls);
};

const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // firefliesMaterial.uniforms.uTime.value = elapsedTime;

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
