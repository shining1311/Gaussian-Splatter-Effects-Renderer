var particle_blendMultiply_default = (
  /* glsl */
  `
    rgb = mix(vec3(1.0), rgb, vec3(a));
    if (rgb.r + rgb.g + rgb.b > 2.99) discard;
`
);
export {
  particle_blendMultiply_default as default
};
