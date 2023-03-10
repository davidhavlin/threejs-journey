import type Experience from "../Experience";
import * as THREE from "three";
import type Resources from "../Utils/Resources";
import type Debug from "../Utils/Debug";
import type { GUI } from "dat.gui";

export default class Environment {
  experience: Experience;
  scene: THREE.Scene;
  sunLight!: THREE.DirectionalLight;
  resources: Resources;
  environmentMap: Record<string, any> = {};
  debug: Debug;
  debugFolder!: GUI;

  constructor(experience: Experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("environment");
    }
    this.setSunLight();
    this.setEnvironmentMap();
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024); // quality of shadow, cim vacsie rozlisenie tym kvalitnejsie
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, 1);
    this.scene.add(this.sunLight);

    // pomocka pri nastavovani tienov, podla tejto pomocky potom nastavim directionalLight.shadow.camera.far a ostatne
    // const directionLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(directionLightCameraHelper);
    this.debugFolder
      .add(this.sunLight, "intensity")
      .name("sunLightIntensity")
      .min(0)
      .max(10)
      .step(0.001);
    this.debugFolder.add(this.sunLight.position, "x").name("sunLightX").min(-5).max(5).step(0.001);
    this.debugFolder.add(this.sunLight.position, "y").name("sunLightY").min(-5).max(5).step(0.001);
    this.debugFolder.add(this.sunLight.position, "z").name("sunLightZ").min(-5).max(5).step(0.001);
  }

  setEnvironmentMap() {
    this.environmentMap.intensity = 0.4;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;
    this.environmentMap.texture.encoding = THREE.sRGBEncoding;

    this.scene.environment = this.environmentMap.texture;

    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };

    this.environmentMap.updateMaterials();

    if (this.debug.active) {
      this.debugFolder
        .add(this.environmentMap, "intensity")
        .name("envMapIntensity")
        .min(0)
        .max(4)
        .step(0.001)
        .onChange(this.environmentMap.updateMaterials);
    }
  }
}
