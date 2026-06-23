var twoSidedLighting_default = (
  /* glsl */
  `
void handleTwoSidedLighting() {
    if (!gl_FrontFacing) dTBN[2] = -dTBN[2];
}
`
);
export {
  twoSidedLighting_default as default
};
