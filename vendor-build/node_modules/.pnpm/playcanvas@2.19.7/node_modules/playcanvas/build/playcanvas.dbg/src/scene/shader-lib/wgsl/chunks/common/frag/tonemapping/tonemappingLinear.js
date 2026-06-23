var tonemappingLinear_default = (
  /* wgsl */
  `
fn toneMap(color: vec3f) -> vec3f {
    return color * getExposure();
}
`
);
export {
  tonemappingLinear_default as default
};
