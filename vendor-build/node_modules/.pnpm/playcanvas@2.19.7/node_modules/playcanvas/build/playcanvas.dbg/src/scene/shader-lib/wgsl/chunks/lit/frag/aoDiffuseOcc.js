var aoDiffuseOcc_default = (
  /* wgsl */
  `
fn occludeDiffuse(ao: f32) {
    dDiffuseLight = dDiffuseLight * ao;
}
`
);
export {
  aoDiffuseOcc_default as default
};
