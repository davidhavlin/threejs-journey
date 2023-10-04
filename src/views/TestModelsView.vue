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
const debugObject = {};

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

// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath("/src/assets/draco/");
const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

// gltfLoader.load("/src/assets/models/Duck/glTF-Embedded/Duck.gltf", (model) => {
// gltfLoader.load("/src/assets/models/Duck/glTF-Binary/Duck.glb", (model) => {
// gltfLoader.load("/src/assets/models/Duck/glTF/Duck.gltf", (model) => {
//   scene.add(model.scene.children[0]);
// });
let mixer: THREE.AnimationMixer | null = null;
const nieco = new THREE.Group();
scene.add(nieco);

gltfLoader.load("/src/assets/models/profit/gltf_test_07.gltf", (gltf) => {
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);
  console.log("", { mixer, hm: gltf.scene });
  // action.paused = true;
  // action.time = 0;
  // action.play();
  // const [obj, obj2] = gltf.scene.children[0].children;

  // obj.castShadow = true;
  // obj.receiveShadow = true;
  // obj2.castShadow = true;
  // obj2.receiveShadow = true;

  // const greyColor = new THREE.Color("#EAE9E7");
  // obj.material.color = greyColor;

  // obj.scale.y = 0.1;

  // console.log("", { scene: gltf.scene, obj, obj2 });
  // // scene.add(...gltf.scene.children);
  nieco.add(gltf.scene);

  updateAllMaterials();
});
// gltfLoader.load("/src/assets/models/Fox/glTF/Fox.gltf", (model) => {
//   mixer = new THREE.AnimationMixer(model.scene);
//   // const action = mixer.clipAction(model.animations[0]);
//   // const action = mixer.clipAction(model.animations[1]);
//   const action = mixer.clipAction(model.animations[2]);

//   action.play();

//   model.scene.scale.set(0.025, 0.025, 0.025);
//   scene.add(model.scene);
// });
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      console.log("", { child });
      /** da sa to nastavit aj defaultne s scene.environment = environmentMap; */
      /** ale kedze to chceme menit v gui tak to tu necham */
      // child.material.envMap = environmentMap;
      // child.material.envMapIntensity = debugObject.envMapIntensity;
      // in real project, this is bad idea
      child.castShadow = true;
      child.receiveShadow = true;
      // child.material.encoding = THREE.sRGBEncoding;
    }
  });
};

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/src/assets/textures/environmentMaps/0/px.jpg",
  "/src/assets/textures/environmentMaps/0/nx.jpg",
  "/src/assets/textures/environmentMaps/0/py.jpg",
  "/src/assets/textures/environmentMaps/0/ny.jpg",
  "/src/assets/textures/environmentMaps/0/pz.jpg",
  "/src/assets/textures/environmentMaps/0/nz.jpg",
]);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 0.2,
    // roughness: 0.4,
    // envMap: environmentMapTexture,
    // envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -0.5 * Math.PI;
// floor.position.y = -1;

scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.set(1024, 1024);
// directionalLight.shadow.camera.far = 15;
// directionalLight.shadow.camera.left = -7;
// directionalLight.shadow.camera.top = 7;
// directionalLight.shadow.camera.right = 7;
// directionalLight.shadow.camera.bottom = -7;
// directionalLight.position.set(5, 5, 5);

const sunLight = new THREE.DirectionalLight("#ffffff", 0.6);
sunLight.castShadow = true;
sunLight.shadow.camera.far = 15;
sunLight.shadow.mapSize.set(1024, 1024); // quality of shadow, cim vacsie rozlisenie tym kvalitnejsie
sunLight.shadow.normalBias = 0.05;
sunLight.position.set(5, 4, 5);
// scene.add(sunLight);
nieco.add(sunLight);

scene.add(ambientLight);

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

  // renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // renderer.setSize(sizes.width, sizes.height);
  // renderer.render(scene, camera);

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  // renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMappingExposure = 3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

    if (mixer) {
      mixer.update(deltaTime);
    }

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
