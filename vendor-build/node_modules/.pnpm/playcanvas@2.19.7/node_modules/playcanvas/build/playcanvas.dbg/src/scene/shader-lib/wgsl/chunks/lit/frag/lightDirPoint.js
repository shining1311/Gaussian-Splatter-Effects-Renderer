var lightDirPoint_default = (
  /* wgsl */
  `
fn evalOmniLight(lightPosW: vec3f) -> vec3f {
    return vPositionW - lightPosW;
}
`
);
export {
  lightDirPoint_default as default
};
