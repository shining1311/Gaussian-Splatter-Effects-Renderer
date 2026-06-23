var particleAnimFrameClamp_default = (
  /* glsl */
  `
    float animFrame = min(floor(texCoordsAlphaLife.w * animTexParams.y) + animTexParams.x, animTexParams.z);
`
);
export {
  particleAnimFrameClamp_default as default
};
