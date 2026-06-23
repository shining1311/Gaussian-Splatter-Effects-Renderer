var particle_billboard_default = (
  /* glsl */
  `
    quadXY = rotate(quadXY, inAngle, rotMatrix);
    vec3 localPos = billboard(particlePos, quadXY);
`
);
export {
  particle_billboard_default as default
};
