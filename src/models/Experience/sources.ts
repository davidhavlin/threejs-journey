export const sources = [
  {
    name: "environmentMapTexture",
    type: "cubeTexture",
    path: [
      "/src/assets/textures/environmentMaps/0/px.jpg",
      "/src/assets/textures/environmentMaps/0/nx.jpg",
      "/src/assets/textures/environmentMaps/0/py.jpg",
      "/src/assets/textures/environmentMaps/0/ny.jpg",
      "/src/assets/textures/environmentMaps/0/pz.jpg",
      "/src/assets/textures/environmentMaps/0/nz.jpg",
    ],
  },
  {
    name: "grassColorTexture",
    type: "texture",
    path: ["/src/assets/textures/dirt/color.jpg"],
  },
  {
    name: "grassNormalTexture",
    type: "texture",
    path: ["/src/assets/textures/dirt/normal.jpg"],
  },
  {
    name: "foxModel",
    type: "gltfModel",
    path: "/src/assets/models/Fox/glTF/Fox.gltf",
  },
] as const;

export type SourceNames = typeof sources[number]["name"];
export type SourceTypes = typeof sources[number]["type"];
export type Source = {
  name: SourceNames;
  type: SourceTypes;
  path: string & string[];
};

type wtf = SourceTypes extends "texture" ? never : string;
