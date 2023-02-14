import type Experience from "../Experience";
import type Resources from "../Utils/Resources";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type Time from "../Utils/Time";
import type Debug from "../Utils/Debug";
import type { GUI } from "dat.gui";

export default class Fox {
  experience: Experience;
  scene: THREE.Scene;
  resources: Resources;
  time: Time;
  debug: Debug;
  debugFolder!: GUI;

  resource: GLTF;
  model!: THREE.Group;
  animation!: any;

  constructor(experience: Experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    this.setDebug();

    this.resource = this.resources.items.foxModel;

    this.setModel();
    this.setAnimation();
  }

  setDebug() {
    if (!this.debug.active) return;
    this.debugFolder = this.debug.ui.addFolder("fox");
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.set(0.02, 0.02, 0.02);
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.model);
    // this.animation.action = this.animation.mixer.clipAction(this.resource.animations[0]);
    // this.animation.action.play();

    this.animation.actions = {
      idle: this.animation.mixer.clipAction(this.resource.animations[0]),
      walking: this.animation.mixer.clipAction(this.resource.animations[1]),
      running: this.animation.mixer.clipAction(this.resource.animations[2]),
    };
    this.animation.currentAction = this.animation.actions.idle;
    this.animation.currentAction.play();

    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.currentAction;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);
      this.animation.currentAction = newAction;
    };

    if (this.debug.active) {
      const debugObject = {
        playIdle: () => {
          this.animation.play("idle");
        },
        playWalking: () => {
          this.animation.play("walking");
        },
        playRunning: () => {
          this.animation.play("running");
        },
      };
      this.debugFolder.add(debugObject, "playIdle");
      this.debugFolder.add(debugObject, "playWalking");
      this.debugFolder.add(debugObject, "playRunning");
    }
  }

  update() {
    this.animation.mixer.update(this.time.delta / 1000);
  }
}
