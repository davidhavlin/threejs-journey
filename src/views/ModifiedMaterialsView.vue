<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI({ width: 400 });

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 1;
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
 * Material
 */

// Textures
const mapTexture = textureLoader.load("/src/assets/models/LeePerrySmith/color.jpg");
mapTexture.encoding = THREE.sRGBEncoding;

const normalTexture = textureLoader.load("/src/assets/models/LeePerrySmith/normal.jpg");

// Material
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking,
});

const customUniforms = {
  uTime: { value: 0 },
};

material.onBeforeCompile = (shader) => {
  // menime vertex shader threejs materialu, proste si najdeme riadok co chceme zamenit
  // ked tu nieco zmenim musim aj v depthMaterialu
  shader.uniforms.uTime = customUniforms.uTime;

  const newVertexFunctionString = `
    #include <common>
    
    uniform float uTime;
    mat2 get2dRotateMatrix(float _angle)
    {
      return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
    }
  `;
  const newBeginNormal = `
    #include <beginnormal_vertex>

    float angle = sin(position.y + uTime) * 0.5;
    mat2 rotateMatrix = get2dRotateMatrix(angle);

    objectNormal.xz =  objectNormal.xz * rotateMatrix;
  `;
  const newVertexString = `
    #include <begin_vertex>

    transformed.xz =  transformed.xz * rotateMatrix;
  `;

  shader.vertexShader = shader.vertexShader.replace("#include <common>", newVertexFunctionString);
  // prettier-ignore
  shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>",newBeginNormal);
  shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", newVertexString);
};
// nieco podobne pre material, kvoli tienom ale tienom ktore su na ostatnych objektoch, toto to fixne
depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;

  const newVertexFunctionString = `
    #include <common>
    
    uniform float uTime;
    mat2 get2dRotateMatrix(float _angle)
    {
      return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
    }
  `;
  const newVertexString = `
    #include <begin_vertex>

    float angle = sin(position.y + uTime) * 0.5;
    mat2 rotateMatrix = get2dRotateMatrix(angle);

    transformed.xz =  transformed.xz * rotateMatrix;
  `;

  shader.vertexShader = shader.vertexShader.replace("#include <common>", newVertexFunctionString);
  shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", newVertexString);
};

/**
 * Models
 */
gltfLoader.load("/src/assets/models/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
  // Model
  const mesh = gltf.scene.children[0];
  mesh.rotation.y = Math.PI * 0.5;
  mesh.material = material;
  mesh.customDepthMaterial = depthMaterial;
  scene.add(mesh);

  // Update materials
  updateAllMaterials();
});

/**
 * Plane
 */

const plane = new THREE.Mesh(new THREE.PlaneGeometry(15, 15, 15), new THREE.MeshStandardMaterial());
plane.rotation.y = Math.PI;
plane.position.y = -5;
plane.position.z = 5;
scene.add(plane);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

// Sizes
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

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    controls.update();
    const elapsedTime = clock.getElapsedTime();

    customUniforms.uTime.value = elapsedTime;

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
