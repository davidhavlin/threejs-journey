import * as THREE from "three";
import type Sizes from "./Utils/Sizes";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Camera {
  sizes: Sizes;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  instance!: THREE.PerspectiveCamera;
  controls!: OrbitControls;

  constructor(sizes: Sizes, scene: THREE.Scene, canvas: HTMLCanvasElement) {
    this.sizes = sizes;
    this.scene = scene;
    this.canvas = canvas;

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.instance = new THREE.PerspectiveCamera(35, aspectRatio, 0.1, 100);
    this.instance.position.set(6, 4, 8);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
    console.log("", "resizeeeeee");
  }

  update() {
    this.controls.update();
  }
}
