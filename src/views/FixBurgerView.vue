<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI({ width: 400 });
const debugObject = {
  envMapIntensity: 5,
};

/** Loaders */
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
dracoLoader.setDecoderPath("/src/assets/draco/");
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("/src/assets/models/burger.glb", (gltf) => {
  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.position.set(0, -1, 0);
  // gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  gui.add(gltf.scene.rotation, "y").min(-Math.PI).max(Math.PI).step(0.001).name("rotation");

  updateAllMaterials();
});

// Scene
const scene = new THREE.Scene();

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      /** da sa to nastavit aj defaultne s scene.environment = environmentMap; */
      /** ale kedze to chceme menit v gui tak to tu necham */
      // child.material.envMap = environmentMap;
      child.material.envMapIntensity = debugObject.envMapIntensity;
      // in real project, this is bad idea
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

gui.add(debugObject, "envMapIntensity").min(0).max(10).step(0.001).onChange(updateAllMaterials);

const environmentMap = cubeTextureLoader.load([
  "/src/assets/textures/environmentMaps/1/px.jpg",
  "/src/assets/textures/environmentMaps/1/nx.jpg",
  "/src/assets/textures/environmentMaps/1/py.jpg",
  "/src/assets/textures/environmentMaps/1/ny.jpg",
  "/src/assets/textures/environmentMaps/1/pz.jpg",
  "/src/assets/textures/environmentMaps/1/nz.jpg",
]);
// toto je dobre pouzivat na environment mapy a vlastne vsetky texture ktore VIDNO (nie na normalmapy napr), lepsie farby
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;
scene.environment = environmentMap;
/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10; // ako daleko dosahuje tien, cim mensie tym optimalnejsie
directionalLight.shadow.mapSize.set(1024, 1024); // quality of shadow, cim vacsie rozlisenie tym kvalitnejsie
// FIX pre divne tiene na objekte ktore sposobuje SAM objekt
// directionalLight.shadow.bias = 0.1 // fix pre rovne (flat) objekty
directionalLight.shadow.normalBias = 0.02; // fix pre rounded (niekedy aj pre flat) objekty, posuva hranicu dovnutra obj, treba ju proste upravit dokym artefakti nezmiznu
scene.add(directionalLight);

// pomocka pri nastavovani tienov, podla tejto pomocky potom nastavim directionalLight.shadow.camera.far a ostatne
// const directionLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionLightCameraHelper);

directionalLight.position.set(0.25, 3, -2.25);
gui.add(directionalLight, "intensity").min(0).max(10).step(0.001).name("lightIntensity");
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001).name("lightX");
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001).name("lightY");
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001).name("lightZ");

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
camera.position.z = 9;
camera.position.y = 2;
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

  // ZAPINAT ANTIALIS LEN PRE MONITORY S MENSIM PIXEL RATIOM AKO 2, pretoze tie to nepotrebuju
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: false, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding; // for realistic colors/lights
  // renderer.outputEncoding = THREE.LinearEncoding // This is default
  renderer.toneMapping = THREE.ReinhardToneMapping;

  gui
    .add(renderer, "toneMapping", {
      No: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
    })
    .onFinishChange(() => {
      if (renderer) renderer.toneMapping = Number(renderer?.toneMapping);
      updateAllMaterials();
    });
  gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

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
