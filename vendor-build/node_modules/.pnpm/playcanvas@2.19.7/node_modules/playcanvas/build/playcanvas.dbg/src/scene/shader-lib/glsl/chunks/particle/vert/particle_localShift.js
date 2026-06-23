var particle_localShift_default = (
  /* glsl */
  `
    particlePos = (matrix_model * vec4(particlePos, 1.0)).xyz;
`
);
export {
  particle_localShift_default as default
};
