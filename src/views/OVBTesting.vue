<script setup lang="ts">
import * as THREE from "three";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import { Mesh, MeshBasicMaterial } from "three";
import { gsap } from "gsap";
// import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

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

const testTexture = textureLoader.load("/src/assets/models/Test3/01/Ramp_01.png");

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      /** da sa to nastavit aj defaultne s scene.environment = environmentMap; */
      /** ale kedze to chceme menit v gui tak to tu necham */
      // child.material.envMap = environmentMap;
      child.material.envMapIntensity = debugObject.envMapIntensity;
      // in real project, this is bad idea
      // child.castShadow = true;
      // child.receiveShadow = true;
    }
  });
};

/** Floor */
const firstSection = new THREE.Group();
scene.add(firstSection);
firstSection.position.y = -1;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: "#F5F5F5", opacity: 0.7, transparent: true })
);
floor.rotation.x = -0.5 * Math.PI;
floor.position.y = 0;
floor.receiveShadow = true;
firstSection.add(floor);

const groupCubes = new THREE.Group();
firstSection.add(groupCubes);
groupCubes.position.x = -0.5;
groupCubes.position.z = 4;
// groupCubes.position.y = -1;
gui.add(groupCubes.rotation, "y", -10, 10, 0.001).name("Rotate groupCubes Y");
// groupCubes.translateX(1);
const groupGenderRepresentation = new THREE.Group();
groupGenderRepresentation.position.y = -5;
scene.add(groupGenderRepresentation);
const CUBE_WIDTH = 0.6;
const CUBE_WIDTH_SMALL = 0.3;

const cubeWomen = new THREE.Mesh(
  new RoundedBoxGeometry(3, CUBE_WIDTH_SMALL, CUBE_WIDTH_SMALL, 10, 0.01),
  new THREE.MeshPhongMaterial({ color: "red", flatShading: true })
);
const cubeMen = new THREE.Mesh(
  new RoundedBoxGeometry(3, CUBE_WIDTH_SMALL, CUBE_WIDTH_SMALL, 10, 0.01),
  new THREE.MeshStandardMaterial({
    color: "blue",
    flatShading: true,
    metalness: 0.05,
    roughness: 0.1,
  })
);
cubeWomen.position.y = 0.3;
cubeWomen.rotateX(0.3);
cubeMen.position.y = -0.3;
groupGenderRepresentation.add(cubeWomen, cubeMen);

const DISTANCE = 4;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(CUBE_WIDTH, 1.4, CUBE_WIDTH),
  new THREE.MeshStandardMaterial({ color: "white", map: testTexture })
);

const test = ref<HTMLElement | null>(null);

cube1.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(cube1.geometry.attributes.uv.array, 2)
);
const cube2 = new THREE.Mesh(
  new RoundedBoxGeometry(CUBE_WIDTH, 2.3, CUBE_WIDTH, 10, 0.01),
  new THREE.MeshPhongMaterial({ color: "#56C5D7", flatShading: true })
  // gradientMaterial
);
cube2.geometry.translate(0, 1.15, 0); // half of cubeHeight

// cube2.scale.set(1, 1, 2);
cube1.castShadow = true;
cube2.castShadow = true;
cube1.position.set(0, 1, 0);
cube1.rotation.set(0, 0.3, 0);
cube2.rotation.set(0, 0.3, 0);
cube2.position.set(0.9, 0, 0.4);
cube1.position.y = 1.4 / 2;

groupCubes.add(cube1, cube2);

// let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
// shader = shader.replace(
//   "#ifdef USE_SHADOWMAP",
//   `#ifdef USE_SHADOWMAP
//   #define LIGHT_WORLD_SIZE 0.005
// 				#define LIGHT_FRUSTUM_WIDTH 3.75
// 				#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
// 				#define NEAR_PLANE 9.5

// 				#define NUM_SAMPLES 17
// 				#define NUM_RINGS 11
// 				#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES

// 				vec2 poissonDisk[NUM_SAMPLES];

// 				void initPoissonSamples( const in vec2 randomSeed ) {
// 					float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
// 					float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

// 					// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
// 					float angle = rand( randomSeed ) * PI2;
// 					float radius = INV_NUM_SAMPLES;
// 					float radiusStep = radius;

// 					for( int i = 0; i < NUM_SAMPLES; i ++ ) {
// 						poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
// 						radius += radiusStep;
// 						angle += ANGLE_STEP;
// 					}
// 				}

// 				float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
// 					return (zReceiver - zBlocker) / zBlocker;
// 				}

// 				float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
// 					// This uses similar triangles to compute what
// 					// area of the shadow map we should search
// 					float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
// 					float blockerDepthSum = 0.0;
// 					int numBlockers = 0;

// 					for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
// 						float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
// 						if ( shadowMapDepth < zReceiver ) {
// 							blockerDepthSum += shadowMapDepth;
// 							numBlockers ++;
// 						}
// 					}

// 					if( numBlockers == 0 ) return -1.0;

// 					return blockerDepthSum / float( numBlockers );
// 				}

// 				float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
// 					float sum = 0.0;
// 					float depth;
// 					#pragma unroll_loop_start
// 					for( int i = 0; i < 17; i ++ ) {
// 						depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
// 						if( zReceiver <= depth ) sum += 1.0;
// 					}
// 					#pragma unroll_loop_end
// 					#pragma unroll_loop_start
// 					for( int i = 0; i < 17; i ++ ) {
// 						depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
// 						if( zReceiver <= depth ) sum += 1.0;
// 					}
// 					#pragma unroll_loop_end
// 					return sum / ( 2.0 * float( 17 ) );
// 				}

// 				float PCSS ( sampler2D shadowMap, vec4 coords ) {
// 					vec2 uv = coords.xy;
// 					float zReceiver = coords.z; // Assumed to be eye-space z in this code

// 					initPoissonSamples( uv );
// 					// STEP 1: blocker search
// 					float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );

// 					//There are no occluders so early out (this saves filtering)
// 					if( avgBlockerDepth == -1.0 ) return 1.0;

// 					// STEP 2: penumbra size
// 					float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
// 					float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;

// 					// STEP 3: filtering
// 					//return avgBlockerDepth;
// 					return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
// 				}`
// );
// shader = shader.replace(
//   "#if defined( SHADOWMAP_TYPE_PCF )",
//   `return PCSS( shadowMap, shadowCoord );
//   #if defined( SHADOWMAP_TYPE_PCF )`
// );
// THREE.ShaderChunk.shadowmap_pars_fragment = shader;

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// scene.fog = new THREE.Fog("#F3F6FB", 15, 20);
// gui.add(scene.fog, "y", -10, 10, 0.001).name("Rotate groupCubes Y");

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
const l = new THREE.HemisphereLight("white", "#E7ECF5", 0.3);

// scene.add(ambientLight);
// scene.add(l);

// const pointLight = new THREE.PointLight( 0xffffff, 1 );
// 				camera.add( pointLight );

const dirLight = new THREE.DirectionalLight("#ffffff", 0.2);
dirLight.castShadow = true;
dirLight.shadow.camera.far = 11;
dirLight.shadow.mapSize.width = 10;
dirLight.shadow.mapSize.height = 10;
// dirLight.shadow.radius = 4; // ! todo
// dirLight.shadow.bias = -0.0005;
// dirLight.shadow.blurSamples = 1; // ! todo
dirLight.shadow.mapSize.set(1024, 1024); // quality of shadow, cim vacsie rozlisenie tym kvalitnejsie
// dirLight.shadow.normalBias = -0.05;
// dirLight.position.set(-5, 7, 8);
dirLight.position.set(1.5, 5, -1);
dirLight.shadow.camera.scale.set(0.5, 0.5, 1);
dirLight.target.position.set(0, 0, 5);
dirLight.target.updateMatrixWorld();

const dirLight2 = new THREE.DirectionalLight("#ffffff", 0.4);
dirLight2.castShadow = true;
dirLight2.shadow.camera.far = 15;
dirLight2.shadow.bias = -0.0;
dirLight2.shadow.mapSize.set(100, 100);
dirLight2.position.set(-8, 9, 4);

// scene.add(dirLight);
scene.add(dirLight2);

const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight, 0.9, "red");
const directionalLightCameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
const d2Helper = new THREE.CameraHelper(dirLight2.shadow.camera);
directionalLightCameraHelper.visible = true;
// scene.add(directionalLightHelper, directionalLightCameraHelper);
// scene.add(directionalLightHelper, directionalLightCameraHelper);
// scene.add(d2Helper);

// Camera Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(20, aspectRatio, 0.1, 50);
camera.position.set(0, 2, 20);
camera.lookAt(0, 0, 0);
// camera.updateProjectionMatrix();
// camera.updateMatrixWorld();
cameraGroup.add(camera);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);

gui.add(camera.position, "y", -50, 50, 0.001).name("cameraY");
gui.add(camera.position, "z", -50, 50, 0.001).name("cameraZ");
gui
  .add(camera, "fov", 0, 70, 0.001)
  .name("Camera FOV")
  .onFinishChange(() => {
    camera.updateProjectionMatrix();
  });

// const a = new THREE.WebGLRenderTarget();

const handleResize = () => {
  if (!camera || !renderer) return;
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  cssRenderer.setSize(sizes.width, sizes.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  const el = toto.value;
  // // Get the pixel dimensions of the container
  const containerWidth = el.clientWidth;
  const containerHeight = el.clientHeight;

  // Calculate the aspect ratio of the container
  const aspectRatio = containerWidth / containerHeight;

  let s = 0.0051;
  if (pixelRatio > 1) {
    s = 0.014 / pixelRatio;
  }

  const cubeWidth = aspectRatio * containerHeight * s;
  const cubeHeight = containerHeight * s;

  cube.scale.set(cubeWidth, cubeHeight, 1);
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

const stats = Stats();

const nieco = ref<HTMLElement | null>(null);
const toto = ref<HTMLElement | null>(null);
const always = ref<HTMLElement | null>(null);

// Create the CSS3D renderer
const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(sizes.width, sizes.height);
cssRenderer.domElement.style.position = "fixed";
cssRenderer.domElement.style.pointerEvents = "none";
cssRenderer.domElement.style.top = "0";
cssRenderer.domElement.style.left = "0";
cssRenderer.domElement.style.right = "0";
cssRenderer.domElement.style.bottom = "0";
document.body.appendChild(cssRenderer.domElement);

const label = document.createElement("h1");
label.textContent = "Label";
label.style.color = "white";
label.style.textAlign = "center";

// const labelObject = new CSS3DObject(label);
// labelObject.position.set(0, 0, 0);
// scene.add(labelObject);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "red" });
const cube = new THREE.Mesh(geometry, material);

// Renderer
const setRenderer = async () => {
  await nextTick();
  if (!canvas.value) return;
  listenForResize();
  listenForScroll();
  document.body.appendChild(stats.dom);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  const el = toto.value;
  // // Get the pixel dimensions of the container
  const containerWidth = el.clientWidth;
  const containerHeight = el.clientHeight;

  // Calculate the aspect ratio of the container
  const aspectRatio = containerWidth / containerHeight;

  let s = 0.0052;
  if (pixelRatio > 1) {
    s = 0.014 / pixelRatio;
  }

  const cubeWidth = aspectRatio * containerHeight * s;
  const cubeHeight = containerHeight * s;

  cube.scale.set(cubeWidth, cubeHeight, 1);

  scene.add(cube);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
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
  // changeRendererBg();

  // const labelObject = new CSS2DObject(nieco.value);
  // labelObject.position.set(0, 0, 4);
  // scene.add(labelObject);

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

  const box = new THREE.Box3().setFromObject(cube1);

  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  console.log("", { box, depth });

  const cssElement = new CSS2DObject(test.value);

  // cssElement.position.add(cube1.position);
  cube1.getWorldPosition(cssElement.position);
  const scale = 180 / width;
  test.value.style.width = width * scale + "px";
  test.value.style.height = height * scale + "px";
  scene.add(cssElement);

  startLoop(renderer);
};

const clock = new THREE.Clock();
let previousTime = 0;

const onActionOne = () => {
  const turn = Math.PI * 2;
  gsap.to(groupCubes.rotation, {
    // x: "+=6",
    y: `+=${turn}`,
    // z: "+=1.5",
    ease: "power2.inOut",
    duration: 1.5,
  });
};
const onActionTwo = () => {
  console.log("", cube2);
  const scaleY = cube2.scale.y;
  gsap.set(cube2.scale, { y: 0 });
  gsap.to(cube2.scale, {
    // x: "+=6",
    y: scaleY,
    // z: "+=1.5",
    ease: "power2.inOut",
    onUpdate() {
      const box = new THREE.Box3().setFromObject(cube2);
      // const width = nie.max.x - nie.min.x;
      const height = box.max.y - box.min.y;
      console.log("", height);
    },
    duration: 1.5,
  });
};
const onActionThree = () => {
  gsap.to(camera.position, { z: 20, y: 4, x: 0 });
};

const startLoop = (renderer: THREE.WebGLRenderer) => {
  // const controls = new OrbitControls(camera, canvas.value);
  // controls.enableDamping = true;
  const htmlObj = new CSS2DObject(always.value);
  const bbox = new THREE.Box3().setFromObject(cube2);
  const center = bbox.getCenter(new THREE.Vector3());

  htmlObj.position.copy(center);

  // cube2.getWorldPosition(htmlObj.position);
  scene.add(htmlObj);

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    stats.update();

    // const nie = cube2.getWorldPosition(new THREE.Vector3());
    const nie = new THREE.Box3().setFromObject(cube2);
    // const width = nie.max.x - nie.min.x;
    const height = nie.max.y - nie.min.y;
    // cube3

    // console.log("", { height, y: cube2.scale.y });

    // camera.position.y = (-scrollY / sizes.height) * DISTANCE;
    // camera.position.y = (-scrollY / sizes.height) * 6;
    cameraGroup.position.y = (-scrollY / sizes.height) * 6;

    // const parallaxX = cursor.x * 0.5;
    // const parallaxY = -cursor.y * 0.5;

    // // Easing (Smoothing), faster on more fps screens, thats why we multiply by deltaTime
    // cameraGroup.position.x += ((parallaxX - cameraGroup.position.x) / 0.4) * deltaTime; // (/ 20) alebo (* 0.02)
    // cameraGroup.position.y += ((parallaxY - cameraGroup.position.y) / 0.4) * deltaTime; // cim vacsie cislo tym vacsi easing

    // controls.update();

    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
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
    <div class="buttons">
      <button @click="onActionOne" class="action">Action 1 Rotate</button>
      <button @click="onActionTwo" class="action">Action 2 Scale</button>
      <button @click="onActionThree" class="action">Action 3</button>
    </div>

    <div ref="nieco" class="nieco">Nieco</div>
    <div class="over-fill">
      <div ref="toto" class="toto">render cube here</div>
    </div>
    <div ref="test" class="test">test</div>
    <div ref="always" class="always">always in center</div>

    <section><h1>Test 1</h1></section>
    <section><h1>Test 2</h1></section>
    <section><h1>Test 3</h1></section>
  </div>
</template>

<style scoped>
.nieco {
  max-width: 300px;
  width: 100%;
  height: 150px;
  /* background-color: rgba(255, 0, 0, 0.255); */
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

.always {
  width: 60px;
  height: 60px;
  background-color: coral;
  border-radius: 20px;
}

.toto {
  /* max-width: 700px; */
  width: 100%;
  height: 200px;
  z-index: 100;
  background-color: rgba(0, 0, 255, 0.243);
}
.test {
  min-width: 10px;
  min-height: 10px;
  background-color: rgba(0, 128, 0, 0.339);
}
.page .wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f0f4f9;
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
