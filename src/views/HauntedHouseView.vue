<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import DoorBaseColor from "/src/assets/textures/door/Door_Wood_001_basecolor.jpg";
import DoorAmbientOcclusion from "/src/assets/textures/door/Door_Wood_001_ambientOcclusion.jpg";
import DoorHeight from "/src/assets/textures/door/Door_Wood_001_height.png";
import DoorMetallic from "/src/assets/textures/door/Door_Wood_001_metallic.jpg";
import DoorNormal from "/src/assets/textures/door/Door_Wood_001_normal.jpg";
import DoorOpacity from "/src/assets/textures/door/Door_Wood_001_opacity.jpg";
import DoorRoughness from "/src/assets/textures/door/Door_Wood_001_roughness.jpg";

/**
 Loading
*/
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  // console.log("start");
};
loadingManager.onProgress = (_, loaded, total) => {
  // console.log("prgoress", { loaded, total });
};
loadingManager.onLoad = () => {
  // console.log("loaded");
};

// Scene
const scene = new THREE.Scene();

const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

const textureLoader = new THREE.TextureLoader(loadingManager);
const doorColorTexture = textureLoader.load(DoorBaseColor);
const doorAmbientTexture = textureLoader.load(DoorAmbientOcclusion);
const doorHeightTexture = textureLoader.load(DoorHeight);
const doorMetallicTexture = textureLoader.load(DoorMetallic);
const doorNormalTexture = textureLoader.load(DoorNormal);
const doorOpacityTexture = textureLoader.load(DoorOpacity);
const doorRoughnessTexture = textureLoader.load(DoorRoughness);

const bricksColorTexture = textureLoader.load("/src/assets/textures/bricks/color.jpg");
const bricksAmbientOcclusionTexture = textureLoader.load(
  "/src/assets/textures/bricks/ambientOcclusion.jpg"
);
const bricksNormalTexture = textureLoader.load("/src/assets/textures/bricks/normal.jpg");
const bricksRoughnessTexture = textureLoader.load("/src/assets/textures/bricks/roughness.jpg");

const grassColorTexture = textureLoader.load("/src/assets/textures/grass/color.jpg");
const grassAmbientOcclusionTexture = textureLoader.load(
  "/src/assets/textures/grass/ambientOcclusion.jpg"
);
const grassNormalTexture = textureLoader.load("/src/assets/textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load("/src/assets/textures/grass/roughness.jpg");
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

const parameters = {
  color: 0xff0000,
};

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/** House Object */
const house = new THREE.Group();
scene.add(house);

// Lights
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.position.set(4, 5, -2);

scene.add(ambientLight, moonLight);

/** Door Light */
const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/** Ghosts */
const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
const ghost3 = new THREE.PointLight("#ffff00", 2, 3);

scene.add(ghost1, ghost2, ghost3);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Objects
const material = new THREE.MeshStandardMaterial();

/** Walls */
const HOUSE_HEIGHT = 2.5;
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, HOUSE_HEIGHT, 4),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
);
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = HOUSE_HEIGHT / 2;
house.add(walls);

/** Roof */
const CONE_HEIGHT = 1.5;
const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, CONE_HEIGHT, 4), material);
roof.rotation.y = Math.PI * 0.25;
roof.position.y = HOUSE_HEIGHT + CONE_HEIGHT / 2;
house.add(roof);

/** Door */
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100), // add vertixis for height texture
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorOpacityTexture,
    aoMap: doorAmbientTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetallicTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.y = 1;
door.position.z = 2 + 0.01;
house.add(door);

/** Bushes */
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1, bush2, bush3, bush4);

/** The Graves */
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: "#b2b6b1" });

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.set(x, 0.3, z);
  grave.rotation.y = (Math.random() - 0.5) * 0.5;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.castShadow = true;
  graves.add(grave);
}

/** Floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -0.5 * Math.PI;
floor.position.y = 0;
scene.add(floor);

// Camera, fow and resolution (Aspect ratio)
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
camera.position.set(0, 1, 10);

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
  renderer.setClearColor("#262837");

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  moonLight.castShadow = true;
  doorLight.castShadow = true;
  ghost1.castShadow = true;
  ghost2.castShadow = true;
  ghost3.castShadow = true;
  walls.castShadow = true;
  bush1.castShadow = true;
  bush2.castShadow = true;
  bush3.castShadow = true;
  bush4.castShadow = true;
  floor.receiveShadow = true;

  // Optimize shadows
  doorLight.shadow.mapSize.width = 256;
  doorLight.shadow.mapSize.height = 256;
  doorLight.shadow.camera.far = 7;

  ghost1.shadow.mapSize.width = 256;
  ghost2.shadow.mapSize.width = 256;
  ghost3.shadow.mapSize.width = 256;
  ghost1.shadow.mapSize.height = 256;
  ghost2.shadow.mapSize.height = 256;
  ghost3.shadow.mapSize.height = 256;
  ghost1.shadow.camera.far = 7;
  ghost2.shadow.camera.far = 7;
  ghost3.shadow.camera.far = 7;

  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    controls.update();

    const elapsedTime = clock.getElapsedTime();

    // Update Ghosts
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = -elapsedTime * 0.18;
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

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
