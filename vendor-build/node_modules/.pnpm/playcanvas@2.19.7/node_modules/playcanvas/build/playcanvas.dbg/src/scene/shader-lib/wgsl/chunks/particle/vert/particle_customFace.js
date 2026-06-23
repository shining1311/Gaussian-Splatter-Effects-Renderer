var particle_customFace_default = (
  /* wgsl */
  `
    let rotationResult = rotateWithMatrix(quadXY, inAngle);
    let rotatedQuadXY = rotationResult.rotatedVec;
    rotMatrix = rotationResult.matrix;
    var localPos = customFace(particlePos, rotatedQuadXY);
`
);
export {
  particle_customFace_default as default
};
