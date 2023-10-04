<script setup lang="ts">
import * as THREE from "three";
import { onMounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);
const el = ref<HTMLElement | null>(null);

// Scene
const scene = new THREE.Scene();
const ambient = new THREE.AmbientLight(0x404040, 1.9);
const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(ambient, light);

// Groups
const groupCubes = new THREE.Group();
scene.add(groupCubes);

// groupCubes.rotation.y = 0.5;
groupCubes.rotation.x = 0.3;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: "green" })
);
const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.2, 0.5),
  new THREE.MeshStandardMaterial({ color: "orange" })
);
cube2.position.set(1.5, 0, 0.5);
const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 1.2, 0.3),
  new THREE.MeshStandardMaterial({ color: "blue" })
);
cube3.position.set(-2, 0, 0);

groupCubes.add(cube1);
groupCubes.add(cube2);
groupCubes.add(cube3);

// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "purple" });
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// Scale
mesh.scale.set(0.3, 1.5, 1);

// Rotate
mesh.rotation.reorder("YXZ");
// mesh.rotation.x = Math.PI * 0.25;
// mesh.rotation.y = Math.PI * 0.25;

// Axes helper (for positioning in space)
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// Sizes
const sizes = {
  width: 1000,
  height: 1000,
};

// Camera, fow and resolution (Aspect ratio)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 3;
camera.position.set(0, 0, 3);
scene.add(camera);
camera.lookAt(cube1.position);

// Renderer
const setRenderer = () => {
  const { width, height } = sizes;
  const tempCanvas = document.createElement("canvas");

  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.canvas.id = "cnvs";
  el.value!.appendChild(ctx.canvas);
  console.log("PIXEL", window.devicePixelRatio);

  const pixelRatio = window.devicePixelRatio;

  const renderer = new THREE.WebGLRenderer({ canvas: tempCanvas, alpha: false, antialias: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setScissorTest(true);
  renderer.setSize(width, height);

  const rendererCanvas = renderer.domElement;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // ! ANIMATION
  renderer.setAnimationLoop(() => {
    cube3.rotation.y += 0.01;

    // make sure the canvas for this area is the same size as the area
    if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
      ctx.canvas.width = width;
      ctx.canvas.height = height;
    }

    renderer.setScissor(0, 0, sizes.width, sizes.height);
    renderer.setViewport(0, 0, sizes.width, sizes.height);

    renderer.render(scene, camera);

    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(
      rendererCanvas,
      0,
      0,
      sizes.width * pixelRatio,
      sizes.height * pixelRatio,
      0,
      0,
      sizes.width,
      sizes.height
    );
    // ctx.drawImage(
    //   rendererCanvas,
    //   0,
    //   rendererCanvas.height - height,
    //   width,
    //   height,
    //   0,
    //   0,
    //   width,
    //   height
    // );
  });
};

onMounted(setRenderer);
</script>

<template>
  <div ref="el">
    <!-- <canvas ref="canvas" /> -->
  </div>
</template>
