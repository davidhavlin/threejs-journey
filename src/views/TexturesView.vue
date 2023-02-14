<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
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
  console.log("start");
};
loadingManager.onProgress = (_, loaded, total) => {
  console.log("prgoress", { loaded, total });
};
loadingManager.onLoad = () => {
  console.log("loaded");
};

/**
 Texture, (first is just js way, then three way)
*/
// const image = new Image();
// image.src = DoorColorTexture;
// const texture = new THREE.Texture(image);
// image.onload = () => {
//   texture.needsUpdate = true;
// };
const textureLoader = new THREE.TextureLoader(loadingManager);
const colorTexture = textureLoader.load(DoorBaseColor);
const ambientTexture = textureLoader.load(DoorAmbientOcclusion);
const heightTexture = textureLoader.load(DoorHeight);
const metallicTexture = textureLoader.load(DoorMetallic);
const normalTexture = textureLoader.load(DoorNormal);
const opacityTexture = textureLoader.load(DoorOpacity);
const roughnessTexture = textureLoader.load(DoorRoughness);

// TEXTURE TRANSFORMATION
colorTexture.rotation = Math.PI / 4;
colorTexture.center.set(0.5, 0.5); // nieco ako transform-origin: center center
// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 2;
// colorTexture.offset.x = 1.5;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;

/**  
tento filter je nieco ako v hrach ked si menim graphic nastavenie,
ked veci v dialke nebudu rozmazane ale budu ostre
*/
colorTexture.generateMipmaps = false; // ked pouzivame na minFilter NearestFilter, nepotrebujeme mipmapy
colorTexture.minFilter = THREE.NearestFilter;
// toto sa pouziva ked mam texturu s nizkym rozlisenim ale potrebujem ju ostru, nieco ako minecraft textury
// colorTexture.magFilter = THREE.NearestFilter; // better performance

/**
 End of Texture
*/

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI();

const parameters = {
  color: 0xff0000,
  spin: () => {
    gsap.to(cube1.rotation, { y: cube1.rotation.y + 10, duration: 1 });
  },
};

// Scene
const scene = new THREE.Scene();

// Groups
const groupCubes = new THREE.Group();
scene.add(groupCubes);

const material = new THREE.MeshBasicMaterial({ map: colorTexture });

const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

gui.add(cube1.position, "y", -3, 3, 0.01).name("Custom Y:");
gui.add(cube1.position, "x").min(-3).max(3).step(0.01);
gui.add(cube1.position, "z", -3, 3, 0.01);
gui.add(cube1, "visible");
gui.add(cube1.material, "wireframe");
// gui.add(material, "wireframe");
gui.addColor(parameters, "color").onChange(() => {
  // v lil-gui toto netreba
  material.color.set(parameters.color);
});
gui.add(parameters, "spin");

groupCubes.add(cube1);

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
    // const currentTime = Date.now();
    // const deltaTime = currentTime - time;
    // time = currentTime;

    // const elapsedTime = clock.getElapsedTime();

    // camera.position.set(cursor.x * 3, cursor.y * 3, 3);
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y * 5;
    // camera.lookAt(new THREE.Vector3()); // same as (0,0,0)
    // camera.lookAt(cube1.position);

    controls.update();

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
