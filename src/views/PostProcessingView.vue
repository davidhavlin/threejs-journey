<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'

// Canvas
const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let effectComposer: EffectComposer | null = null;

// Debug
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 2.5;
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
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
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
  if (!camera || !renderer || !effectComposer) return;
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding; // nefunguje ked renderujeme cez render target
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /** FIX PRE ANTIALIASING, (WebGL 2.0) nefunguje na niektore starsie browsre (safari) ale uz to je good */
  // pre starsie prehliadace pouzit FXAA alebo SMAA ako nizsie v commente
  // Render Target
  const antialiasSamples = renderer.getPixelRatio() === 1 ? 2 : 0; // more samples, the better the antialias, (0 = no samples), more = lower performance, najlepsie 1-2, ked ma user vacsia pixelRatio je to zbytocne
  // 800 / 600 je random cislo ktore sa aj tak zmeni pri setSize
  const renderTarget = new THREE.WebGLRenderTarget(800, 600, { samples: antialiasSamples });

  // effectComposer = new EffectComposer(renderer)
  effectComposer = new EffectComposer(renderer, renderTarget);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);

  // Render Pass
  const renderPass = new RenderPass(scene, camera);
  effectComposer.addPass(renderPass);

  // Dot Screeb Pass
  const dotScreenPass = new DotScreenPass();
  dotScreenPass.enabled = false;
  effectComposer.addPass(dotScreenPass);

  // Glitch pass
  const glitchPass = new GlitchPass();
  // glitchPass.goWild = true;
  glitchPass.enabled = false;
  effectComposer.addPass(glitchPass);

  // Unreal bloom pass
  const unrealBloomPass = new UnrealBloomPass();
  unrealBloomPass.strength = 0.3;
  unrealBloomPass.radius = 1;
  unrealBloomPass.threshold = 0.6;
  // unrealBloomPass.enabled = true;
  effectComposer.addPass(unrealBloomPass);
  gui.add(unrealBloomPass, "enabled");
  gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.001);
  gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.001);
  gui.add(unrealBloomPass, "threshold").min(0).max(1).step(0.001);

  // RGB Shift pass
  // tento pass funguje inak, potrebuje shader
  const rgbShiftPass = new ShaderPass(RGBShiftShader);
  rgbShiftPass.enabled = false;
  effectComposer.addPass(rgbShiftPass);

  // Gamma correction pass (fixuje tmavu farbu kedze outputEncoding nefunguje), ostatne passy musia byt pred gammaCorrection
  const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
  effectComposer.addPass(gammaCorrectionShader);

  // Tint pass (CUSTOM PASS), btw pass je rendernuty kazdy jeden frame
  const TintShader = {
    uniforms: {
      //effectComposer providuje tDiffuse
      tDiffuse: { value: null },
      uTint: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;

      void main()
      {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec3 uTint;
      varying vec2 vUv;
      
      void main()
      {
        vec4 color = texture2D(tDiffuse, vUv);
        // color.r += 0.1;
        // color.b += 0.1;
        color.rgb += uTint;
        gl_FragColor = color;
      }
    `,
  };
  const tintPass = new ShaderPass(TintShader);
  tintPass.material.uniforms.uTint.value = new THREE.Vector3(0.2, 0, 0);
  effectComposer.addPass(tintPass);

  gui.add(tintPass.material.uniforms.uTint.value, "x").min(-1).max(1).step(0.001).name("red");
  gui.add(tintPass.material.uniforms.uTint.value, "y").min(-1).max(1).step(0.001).name("green");
  gui.add(tintPass.material.uniforms.uTint.value, "z").min(-1).max(1).step(0.001).name("blue");

  // Displacement pass (CUSTOM PASS) simple wave effect
  // const DisplacementShader = {
  //   uniforms: {
  //     //effectComposer providuje tDiffuse
  //     tDiffuse: { value: null },
  //     uTime: { value: null },
  //   },
  //   vertexShader: `
  //     varying vec2 vUv;

  //     void main()
  //     {
  //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       vUv = uv;
  //     }
  //   `,
  //   fragmentShader: `
  //     uniform sampler2D tDiffuse;
  //     uniform float uTime;
  //     varying vec2 vUv;

  //     void main()
  //     {
  //       vec2 newUv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1);
  //       vec4 color = texture2D(tDiffuse, newUv);
  //       gl_FragColor = color;
  //     }
  //   `,
  // };
  // const displacementPass = new ShaderPass(DisplacementShader);
  // displacementPass.material.uniforms.uTime.value = 0;
  // effectComposer.addPass(displacementPass);

  // Displacement pass (CUSTOM PASS) advanced effect
  const DisplacementShader = {
    uniforms: {
      //effectComposer providuje tDiffuse
      tDiffuse: { value: null },
      uNormalMap: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;

      void main()
      {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D uNormalMap;
      varying vec2 vUv;
      
      void main() // Toto bruno proste skusal
      {
        vec3 normalColor = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
        vec2 newUv = vUv + normalColor.rg * 0.1;
        vec4 color = texture2D(tDiffuse, newUv);

        vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
        float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
        color.rgb += lightness * 1.5;

        gl_FragColor = color;
      }
    `,
  };
  const displacementPass = new ShaderPass(DisplacementShader);
  displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
    "/src/assets/textures/interfaceNormalMap.png"
  );
  effectComposer.addPass(displacementPass);

  // SMAA Pass
  if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    // antialiasing SMAA pre starsie prehliadace ktore nepodporuju WebGL2, musi byt po gammaCorrectionShader
    const smaaPass = new SMAAPass(800, 600);
    effectComposer.addPass(smaaPass);
  }

  // renderer.render(scene, camera);

  startLoop(effectComposer, controls, displacementPass);
};

/**
 * Animate
 */
const clock = new THREE.Clock();

const startLoop = (
  effectComposer: EffectComposer,
  controls: OrbitControls,
  displacementPass: ShaderPass
) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // displacementPass.material.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update();

    // Render
    // renderer.render(scene, camera);
    effectComposer.render();

    // Call tick again on the next frame
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
