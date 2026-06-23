var particleUpdaterRespawn_default = (
  /* wgsl */
  `
    if (outLife >= uniform.lifetime) {
        let subtractAmount = max(uniform.lifetime, uniform.numParticles * particleRate);
        outLife = outLife - subtractAmount;
        visMode = 1.0;
    }
    visMode = select(visMode, 1.0, outLife < 0.0);
`
);
export {
  particleUpdaterRespawn_default as default
};
