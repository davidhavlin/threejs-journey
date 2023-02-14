<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

const canvas = ref<HTMLCanvasElement | null>(null);
const bar = ref<HTMLElement | null>(null);
const progress = ref(0);

let renderer: THREE.WebGLRenderer | null = null;

const handleLoad = () => {
  gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 2, value: 0 });
};

let isSceneReady = false;
const handleProgress = (url: string, loaded: number, total: number) => {
  progress.value = loaded / total;
  if (loaded === total) {
    gsap.to(bar.value, {
      opacity: 0,
      delay: 0.5,
      duration: 1,
      onComplete: () => {
        isSceneReady = true;
      },
    });
  }
  // gsap.set(progress.value, {
  //   scaleX,
  //   duration: 0.5,
  //   overwrite: true,
  //   ease: "none",
  //   onComplete: () => {
  //     if (scaleX === 1) {
  //       gsap.to(progress.value!.parentElement, { opacity: 0, duration: 1 });
  //     }
  //   },
  // });
};

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager(handleLoad, handleProgress);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Base
 */
// Debug

const debugObject = { envMapIntensity: 2.5 };

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/src/assets/textures/environmentMaps/0/px.jpg",
  "/src/assets/textures/environmentMaps/0/nx.jpg",
  "/src/assets/textures/environmentMaps/0/py.jpg",
  "/src/assets/textures/environmentMaps/0/ny.jpg",
  "/src/assets/textures/environmentMaps/0/pz.jpg",
  "/src/assets/textures/environmentMaps/0/nz.jpg",
]);

environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/src/assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2.5, 2.5, 2.5);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster();
const pointRef = ref<HTMLElement | null>(null);
const pointRef2 = ref<HTMLElement | null>(null);
const pointRef3 = ref<HTMLElement | null>(null);
const points = [
  {
    position: new THREE.Vector3(1.55, 0.3, -0.6),
    el: pointRef,
  },
  {
    position: new THREE.Vector3(0.5, 0.8, -1.6),
    el: pointRef2,
  },
  {
    position: new THREE.Vector3(1.6, -1.3, -0.7),
    el: pointRef3,
  },
];

console.log("", { points });

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, -4);
scene.add(camera);

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
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();

const loopOverPoints = () => {
  if (!isSceneReady) return;
  // Go through each point
  for (const p of points) {
    if (!p.el.value) return;
    const screenPosition = p.position.clone();
    screenPosition.project(camera); // dolezita funkcia .project() nam vrati coordinaty (NDC, normalize device coords) ale nie v pixeloch

    raycaster.setFromCamera(screenPosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (!intersects.length) {
      p.el.value.classList.add("visible");
    } else {
      const intersectionDistance = intersects[0].distance;
      const pointDistance = p.position.distanceTo(camera.position);
      if (intersectionDistance < pointDistance) {
        p.el.value.classList.remove("visible");
      } else {
        p.el.value.classList.add("visible");
      }
    }

    const translateX = screenPosition.x * (sizes.width / 2);
    const translateY = -screenPosition.y * (sizes.height / 2);
    // console.log("", p.el.value);
    p.el.value.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }
};

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    loopOverPoints();

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();
};

onMounted(setRenderer);
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResize);
});
</script>

<template>
  <div class="page">
    <div class="wrapper" @mousemove="handleMouseMove">
      <div ref="bar" class="loading-bar">
        <div :style="{ transform: `scaleX(${progress})` }" class="progress"></div>
      </div>
      <canvas ref="canvas" />

      <div ref="pointRef" class="point">
        <div class="label">1</div>
        <div class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </div>
      <div ref="pointRef2" class="point">
        <div class="label">2</div>
        <div class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </div>
      <div ref="pointRef3" class="point">
        <div class="label">3</div>
        <div class="text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </div>
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-bar {
  position: absolute;
  z-index: 10;
  width: 50%;
  height: 30px;
  background-color: cadetblue;
  pointer-events: none;
}
.progress {
  width: 100%;
  height: 100%;
  background-color: aquamarine;
  transition: transform 0.5s;
  transform: scaleX(0);
  transform-origin: left;
}

.point {
  position: absolute;
  top: 50%;
  left: 50%;
}
.point .label {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: rgba(8, 53, 54, 0.748);
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
  color: white;
  border: 1px solid rgb(10, 222, 241);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bolder;
  cursor: help;
  transition: transform 0.3s;
}
.point.visible .label {
  transform: translate(-50%, -50%) scale(1);
}
.point .text {
  position: absolute;
  top: 30px;
  opacity: 0;
  transform: translateX(-50%);
  width: 200px;
  padding: 20px;
  border-radius: 4px;
  background: #000000b5;
  border: 1px solid #ffffff77;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
  transition: opacity 0.3s;
  pointer-events: none;
}

.point:hover .text {
  opacity: 1;
  pointer-events: all;
}
</style>
