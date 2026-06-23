var uv1_default = (
  /* wgsl */
  `
fn getUv1() -> vec2f {
    return vertex_texCoord1;
}
`
);
export {
  uv1_default as default
};
