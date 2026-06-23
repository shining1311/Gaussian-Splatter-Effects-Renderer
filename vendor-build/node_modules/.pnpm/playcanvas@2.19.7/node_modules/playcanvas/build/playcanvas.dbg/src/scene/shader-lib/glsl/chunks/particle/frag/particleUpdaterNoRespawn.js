var particleUpdaterNoRespawn_default = (
  /* glsl */
  `
    if (outLife >= lifetime) {
        outLife -= max(lifetime, numParticles * particleRate);
        visMode = -1.0;
    }
`
);
export {
  particleUpdaterNoRespawn_default as default
};
