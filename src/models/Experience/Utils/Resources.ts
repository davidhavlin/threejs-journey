import * as THREE from "three";
import EventEmitter from "./EventEmitter";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SourceNames, Source } from "../sources";

type Loaders = THREE.TextureLoader | THREE.CubeTextureLoader | GLTFLoader;
type File = GLTF | THREE.Texture | THREE.CubeTexture;

export default class Resources extends EventEmitter {
  sources: Source[];
  loaders: Record<string, Loaders> = {};
  items: Partial<Record<SourceNames, File>> = {};
  toLoad: number;
  loaded = 0;

  constructor(sources: Source[]) {
    super();
    this.sources = sources;
    this.toLoad = this.sources.length;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => this.sourceLoaded(source, file));
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => this.sourceLoaded(source, file));
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => this.sourceLoaded(source, file));
      }
    }
  }

  sourceLoaded(source: Source, file: File) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
