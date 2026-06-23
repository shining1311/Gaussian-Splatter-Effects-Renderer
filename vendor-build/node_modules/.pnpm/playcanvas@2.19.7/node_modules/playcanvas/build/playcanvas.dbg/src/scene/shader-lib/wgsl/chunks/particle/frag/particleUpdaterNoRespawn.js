var particleUpdaterNoRespawn_default = (
  /* wgsl */
  `
    if (outLife >= uniform.lifetime) {
        outLife = outLife - max(uniform.lifetime, uniform.numParticles * particleRate);
        visMode = -1.0;
    }
`
);
export {
  particleUpdaterNoRespawn_default as default
};
