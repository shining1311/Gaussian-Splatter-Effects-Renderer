var particle_customFace_default = (
  /* glsl */
  `
    quadXY = rotate(quadXY, inAngle, rotMatrix);
    vec3 localPos = customFace(particlePos, quadXY);
`
);
export {
  particle_customFace_default as default
};
