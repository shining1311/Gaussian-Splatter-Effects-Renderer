var particle_localShift_default = (
  /* wgsl */
  `
particlePos = (uniform.matrix_model * vec4f(particlePos, 1.0)).xyz;
`
);
export {
  particle_localShift_default as default
};
