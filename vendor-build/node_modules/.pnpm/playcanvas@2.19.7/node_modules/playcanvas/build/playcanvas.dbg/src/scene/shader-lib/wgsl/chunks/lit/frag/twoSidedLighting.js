var twoSidedLighting_default = (
  /* wgsl */
  `
fn handleTwoSidedLighting() {
    if (!pcFrontFacing) { dTBN[2] = -dTBN[2]; }
}
`
);
export {
  twoSidedLighting_default as default
};
