uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // mohli by sme si poslat dalsie random hodnoty ale je to bad for perf. cize pouzijeme poziciu X a vynasobime 100 nech je tam viac 
  // sin() vln tym padom to vyzera viac nahodne, vynasobime random hodnotou aScale, cize mensie sa hybu menej,
  //a zmiernime pohyblivost tym * 0.2
  modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.2; // vdaka sin() ide hore dole

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
  gl_PointSize = uSize * aScale * uPixelRatio; // * uPixelRatio = rovnaka velkost musky na kazdej obrazovke, *aScale aby mali rozne velkosti
  gl_PointSize *= (1.0 / - viewPosition.z); // menime velkost musky na zaklade ako daleko je od kamery, cize odzumujem = mensie
}