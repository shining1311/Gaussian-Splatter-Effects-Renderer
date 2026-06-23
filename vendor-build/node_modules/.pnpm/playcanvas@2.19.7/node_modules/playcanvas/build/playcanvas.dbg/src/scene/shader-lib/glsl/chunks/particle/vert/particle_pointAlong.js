var particle_pointAlong_default = (
  /* glsl */
  `
    // not the fastest way, but easier to plug in; TODO: create rot matrix right from vectors
    inAngle = atan(velocityV.x, velocityV.y);

`
);
export {
  particle_pointAlong_default as default
};
