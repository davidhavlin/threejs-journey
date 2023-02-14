varying vec3 vColor;

void main()
{
  // // SPRAVIT Z POINTU CIRCLE
  // // distance nam vrati polohu pointu relativne k 0.5 a 0.5 cize k stredu
  // float strength = distance(gl_PointCoord, vec2(0.5));
  // // step, ked mame hodnotu pod 0.5 tak 0, ked nad 0.5 tak 1
  // // 1.0 - step to jednoducho invertne
  // strength = 1.0 - step(0.5, strength);

  // // DIFFUSE POINT (ze su kruh ale do stratena)
  // // toto nam vrati distance od stredu, a kedze chceme ist do stratena rychlejsie, vynasobime * 2.0
  // float strength = distance(gl_PointCoord, vec2(0.5)) * 2.0; 
  // // invert
  // strength = 1.0 - strength;

  // LIGHT POINT
  float strength = 1.0 - distance(gl_PointCoord, vec2(0.5)); 
  // nie linearne do stratena ale rychlejsie, na zaciatku vela farby a hned do stratena,, da sa dobre vyskusat v JS Math.pow(0.5, 10)
  strength = pow(strength, 10.0);

  // FINAL COLOR
  // vec3(0.0) je cierna farba, a mix ich zmixuje pomocout strength hodnoty
  vec3 color = mix(vec3(0.0), vColor, strength);
  

  // to nizsie iba lepsi zapis tohoto: gl_FragColor = vec4(strength, strength, strength, 1.0);
  // gl_FragColor = vec4(vec3(strength), 1.0);

  gl_FragColor = vec4(color, 1.0);
}