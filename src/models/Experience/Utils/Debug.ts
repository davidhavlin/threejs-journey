import * as dat from "dat.gui"; // OR INSTALL 'lil-gui'

export default class Debug {
  ui: dat.GUI;
  active = true;

  constructor() {
    this.ui = new dat.GUI();
  }
}
