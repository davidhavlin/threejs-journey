uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    /**
      * Position
      */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // SPIN animacia
    // atan nam vrati uhol
    float angle = atan(modelPosition.x, modelPosition.z);
    // length nam vrati vzdialenost medzi x a z
    float distanceToCenter = length(modelPosition.xz);
    // vypocitame o aky uhol sa ma pohnut particle dalej
    // delime 1.0 / distanceToCenter pretoze chceme tie co su dalej aby sa hybali pomalsie a opacne
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    // pomocou cos a sin umiestnime point v kruhu
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // RANDOMNESS
    // modelPosition.x += aRandomness.x;
    // modelPosition.y += aRandomness.y;
    // modelPosition.z += aRandomness.z;
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    /**
      * Size
      */

    // rozne velikosti Pointu
    gl_PointSize = uSize * aScale;
    // priblizim = vacsi point, oddialim = mensi point
    gl_PointSize *= ( 1.0 / - viewPosition.z );

    vColor = color;
}