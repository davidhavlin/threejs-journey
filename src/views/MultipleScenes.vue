<script setup lang="ts">
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import * as THREE from "three";
import { gsap } from "gsap";
import Stats from "three/examples/jsm/libs/stats.module";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

gsap.registerPlugin(ScrollTrigger);

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
//**
// Debug
const debugObject = {
  bgColor: "#F3F6FB",
  cameraY: 0,
  envMapIntensity: 5,
};
const gui = new dat.GUI({
  width: 350,
});

const changeRendererBg = () => {
  renderer?.setClearColor(debugObject.bgColor);
};

gui.addColor(debugObject, "bgColor").onFinishChange(changeRendererBg);

// Canvas

// Scene
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();
const scene3 = new THREE.Scene();
scene.userData.nieco = 0;
scene2.userData.nieco = 1337;
scene3.userData.nieco = 3333;

const allScenes = [scene, scene2, scene3];

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({ color: "red", flatShading: true })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
    color: "blue",
  })
);
const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({
    color: "green",
    flatShading: true,
    metalness: 0.05,
    roughness: 0.1,
  })
);

cube2.position.y = -8;
cube3.position.y = -14;

scene.add(cube1);
scene2.add(cube2);
scene3.add(cube3);

// Sizes

const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);
const ambientLight2 = new THREE.AmbientLight("#ffffff", 0.5);
const ambientLight3 = new THREE.AmbientLight("#ffffff", 1);
scene.add(ambientLight);
scene2.add(ambientLight2);
scene3.add(ambientLight3);

// Camera Group
// const cameraGroup = new THREE.Group();
// scene.add(cameraGroup);

const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(20, aspectRatio, 0.1, 50);
camera.position.set(0, 2, 20);
camera.lookAt(0, 0, 0);
// camera.updateProjectionMatrix();
// camera.updateMatrixWorld();
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

let scrollY = window.scrollY;
let currentSection = 0;

const listenForScroll = () => {
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / sizes.height);

    if (newSection !== currentSection) {
      currentSection = newSection;
      // gsap.to(sectionMeshes[currentSection].rotation, {
      //   x: "+=6",
      //   y: "+=3",
      //   z: "+=1.5",
      //   ease: "power2.inOut",
      //   duration: 1.5,
      // });
    }
  });
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

const sections = ref<HTMLElement[]>([]);
const activeScenes: THREE.Scene[] = [];

const setScrollTriggers = () => {
  sections.value?.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      markers: true,
      onToggle(self) {
        if (self.isActive) {
          activeScenes.push(allScenes[i]);
        } else {
          const indexOf = activeScenes.indexOf(allScenes[i]);
          activeScenes.splice(indexOf, 1);
        }
      },
    });
  });
};

const space = ref<HTMLElement | null>(null);
const testSettingToSpace = () => {
  const MAGIC = window.devicePixelRatio === 1 ? 194 : 146;
  const HALF_MAGIC = MAGIC / 2;

  // cube1.position.y = 0;
  const { left, top, width, height } = space.value[0]?.getBoundingClientRect();
  const halfOfYSpace = width / 2;
  const halfOfXSpace = height / 2;

  const zaklad = -(sizes.width / MAGIC) / 2; // ! toto funguje na horny lavy roh spacu

  const realTop = top + window.scrollY;
  console.log("", { left, top, realTop });

  const wtf = (left + halfOfYSpace) / MAGIC;
  const hmm = (realTop + halfOfXSpace) / MAGIC;

  const niecoLeft = -(sizes.width / MAGIC) / 2;
  const niecoTop = -(sizes.height / MAGIC) / 2;
  const centerSpaceX = sizes.width + width / 2;
  const centerSpaceY = 0;

  // cube1.position.x = niecoLeft + 0.5;
  cube1.position.x = zaklad + wtf;
  // cube1.position.y = niecoTop - 1;
  cube1.position.y = -hmm + 1.5;

  const www = width / MAGIC;
  const hhh = height / MAGIC;
  cube1.scale.set(www, hhh, 1);

  // cube1.position.x += www / 2;
};

// Renderer
const setRenderer = async () => {
  setScrollTriggers();
  testSettingToSpace();
  setTimeout(() => {
    testSettingToSpace();
  }, 2000);
  await nextTick();
  if (!canvas.value) return;

  listenForResize();
  listenForScroll();

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    alpha: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding; // for realistic colors/lights
  // renderer.outputEncoding = THREE.LinearEncoding // This is default
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  startLoop(renderer);
};

const clock = new THREE.Clock();
let previousTime = 0;

const startLoop = (renderer: THREE.WebGLRenderer) => {
  // const controls = new OrbitControls(camera, canvas.value);
  // controls.enableDamping = true;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    camera.position.y = (-scrollY / sizes.height) * 6;

    // const parallaxX = cursor.x * 0.5;
    // const parallaxY = -cursor.y * 0.5;

    // // Easing (Smoothing), faster on more fps screens, thats why we multiply by deltaTime
    // cameraGroup.position.x += ((parallaxX - cameraGroup.position.x) / 0.4) * deltaTime; // (/ 20) alebo (* 0.02)
    // cameraGroup.position.y += ((parallaxY - cameraGroup.position.y) / 0.4) * deltaTime; // cim vacsie cislo tym vacsi easing

    // controls.update();
    // console.log("", activeScenes);
    for (let i = 0; i < activeScenes.length; i++) {
      const s = activeScenes[i];
      renderer.render(s, camera);
      renderer.autoClear = false;
    }
    renderer.autoClear = true;
    // renderer.render(scene, camera);
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

    <section ref="sections" v-for="(section, i) in 3" :key="i">
      <div v-if="!i" ref="space" class="space"></div>
      <h1>Test {{ i }}</h1>
    </section>
  </div>
</template>

<style scoped>
.space {
  position: absolute;
  right: 20px;
  width: 40%;
  height: 40%;
  background-color: skyblue;
  z-index: 0;
  pointer-events: all;
}
.over-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 200px;
  pointer-events: none;
}
.page .wrapper {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
  /* background-color: #f0f4f9; */
  z-index: 1;
}
.page,
canvas {
  pointer-events: none;
}
.page section {
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  pointer-events: none;
  color: black;
}

.buttons {
  display: flex;
  position: fixed;
  bottom: 0;
}

.action {
  /* width: 80px; */
  white-space: nowrap;
  height: 30px;
  background-color: aquamarine;
}
.action:nth-child(1) {
  background-color: aqua;
}

.page section:nth-of-type(2) {
  justify-content: flex-end;
}

section h1 {
  font-size: 100px;
}
</style>
