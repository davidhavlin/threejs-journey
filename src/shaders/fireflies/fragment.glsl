void main()
{
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(gl_PointCoord, 1.0, 1.0); // gl_PointCoord koordinaty pre point, cize ked chceme UV koordinaty particlu

  float distanceToCenter = distance(gl_PointCoord, vec2(0.5)); // od 0 az po 0.5
  // hodnota co sa hodi na svetla, proste nad 1 dlhsie a potom to dropne na rychlo a smooth na 0, teda nie uplne na 0 preto vidno okraje
  // preto ten fix - 0.1, je to vlastne strength 0.05 * 2
  float strength = (0.05 / distanceToCenter) - 0.1; 
  gl_FragColor = vec4(1.0, 1.0, 1.0, strength); // gl_PointCoord koordinaty pre point, cize ked chceme UV koordinaty particlu
}