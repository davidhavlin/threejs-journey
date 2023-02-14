import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import * as THREE from "three";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import { sources } from "./sources";
import Debug from "./Utils/Debug";

export default class Experience {
  debug: Debug;
  canvas: HTMLCanvasElement;
  sizes: Sizes;
  time: Time;
  scene: THREE.Scene;
  resources: Resources;
  camera: Camera;
  renderer: Renderer;
  world: World;

  constructor(canvas: HTMLCanvasElement) {
    (window as any).experience = this;

    this.debug = new Debug();
    this.canvas = canvas;
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera(this.sizes, this.scene, this.canvas);
    this.renderer = new Renderer(this);
    this.world = new World(this);

    this.sizes.on("resize", this.resize);
    this.time.on("tick", this.update);
  }

  resize = () => {
    this.camera.resize();
    this.renderer.resize();
  };
  update = () => {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  };

  destroy() {
    // lepsie by bolo keby kazda classa mala svoju vlastnu destroy metodu ktora by sa tu volala
    this.sizes.destroy();
    this.time.off("tick");

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const val = child.material[key];

          if (val && typeof val.dispose === "function") {
            val.dispose();
          }
        }
      }
    });
    this.camera.controls.dispose();
    this.renderer.instance.dispose();
    if (this.debug.active) {
      this.debug.ui.destroy();
    }
  }
}
