<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { gsap } from "gsap";
import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'
import CANNON, { Vec3 } from "cannon";
import type { Vector3 } from "three";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;

// Debug
const gui = new dat.GUI({ width: 400 });
const debugObject = {
  createSphere: () =>
    createSphere(Math.random() * 0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    }),
  createCube: () =>
    createCube(Math.random(), Math.random(), Math.random(), {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    }),
};
gui.add(debugObject, "createSphere");
gui.add(debugObject, "createCube");

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

/** PHYSICS */
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// physics materials
const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");
const defaultMaterial = new CANNON.Material("default");

// contact material, kombinacia dvoch materialov a ako sa spravaju pri zrazke (collide)
const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1,
  restitution: 0.7,
});
world.addContactMaterial(concretePlasticContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  material: plasticMaterial,
});
sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));
// world.addBody(sphereBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({ mass: 0, material: concreteMaterial });
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/** Objects */
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
sphere.castShadow = true;
sphere.position.y = 0.5;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -0.5 * Math.PI;
// floor.position.y = -1;

scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);

  startLoop(renderer, controls);
};

let time = Date.now();
const clock = new THREE.Clock();
let oldElapsedTime = 0;

/** Utils */
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const metalicMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
});
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const objectsToUpdate: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
const createSphere = (radius: number, position: Vec3 | Vector3 | Record<string, any>) => {
  const mesh = new THREE.Mesh(sphereGeometry, metalicMaterial);
  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
  });
  body.position.copy(position);
  world.addBody(body);

  objectsToUpdate.push({ mesh, body });
};
const createCube = (
  width: number,
  height: number,
  depth: number,
  position: Vec3 | Vector3 | Record<string, any>
) => {
  const mesh = new THREE.Mesh(cubeGeometry, metalicMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  // https://threejs-journey.com/lessons/physics# 1:18:00 tu vysvetluje preco sa to deli na polovicu
  const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    // material: defaultMaterial  // nemusim kedze je default nastaveny
  });
  body.position.copy(position);
  world.addBody(body);

  objectsToUpdate.push({ mesh, body });
};

createSphere(0.5, { x: 0, y: 3, z: 0 });
createSphere(0.5, { x: 2, y: 3, z: 2 });
createCube(1, 1, 1, { x: 1, y: 1, z: 1 });

const startLoop = (renderer: THREE.WebGLRenderer, controls: OrbitControls) => {
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    controls.update();

    /** Update physics world */
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position); // something like wind
    world.step(1 / 60, deltaTime, 3);

    for (const obj of objectsToUpdate) {
      obj.mesh.position.copy(obj.body.position);
      obj.mesh.quaternion.copy(obj.body.quaternion);
    }

    // sphere.position.x = sphereBody.position.x;
    // sphere.position.y = sphereBody.position.y;
    // sphere.position.z = sphereBody.position.z;
    // sphere.position.copy(sphereBody.position); // short zapis pre kod nad tym

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
