var particle_normal_default = (
  /* wgsl */
  `
output.Normal = normalize(localPos + uniform.matrix_viewInverse[2].xyz);
`
);
export {
  particle_normal_default as default
};
