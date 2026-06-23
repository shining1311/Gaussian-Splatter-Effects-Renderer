var viewDir_default = (
  /* wgsl */
  `
fn getViewDir() {
    dViewDirW = normalize(uniform.view_position - vPositionW);
}
`
);
export {
  viewDir_default as default
};
