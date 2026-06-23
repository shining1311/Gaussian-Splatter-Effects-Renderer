var particleAnimFrameClamp_default = (
  /* wgsl */
  `
    let animFrame: f32 = min(floor(input.texCoordsAlphaLife.w * uniform.animTexParams.y) + uniform.animTexParams.x, uniform.animTexParams.z);
`
);
export {
  particleAnimFrameClamp_default as default
};
