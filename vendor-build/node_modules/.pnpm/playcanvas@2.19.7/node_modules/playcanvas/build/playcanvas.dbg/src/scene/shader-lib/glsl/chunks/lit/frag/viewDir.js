var viewDir_default = (
  /* glsl */
  `
void getViewDir() {
    dViewDirW = normalize(view_position - vPositionW);
}
`
);
export {
  viewDir_default as default
};
