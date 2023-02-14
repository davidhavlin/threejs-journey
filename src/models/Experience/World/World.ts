import type Experience from "../Experience";
import Environment from "./Environment";
import type Resources from "../Utils/Resources";
import Floor from "./Floor";
import Fox from "./Fox";

export default class World {
  experience: Experience;
  scene: THREE.Scene;
  resources: Resources;
  environment!: Environment;
  floor!: Floor;
  fox!: Fox;

  constructor(experience: Experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      this.floor = new Floor(this.experience);
      this.fox = new Fox(this.experience);
      this.environment = new Environment(this.experience);
    });
  }

  update() {
    if (this.fox) this.fox.update();
  }
}
