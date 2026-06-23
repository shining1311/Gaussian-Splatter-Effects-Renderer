var particle_soft_default = (
  /* wgsl */
  `
    output.vDepth = getLinearDepth(localPos);
`
);
export {
  particle_soft_default as default
};
