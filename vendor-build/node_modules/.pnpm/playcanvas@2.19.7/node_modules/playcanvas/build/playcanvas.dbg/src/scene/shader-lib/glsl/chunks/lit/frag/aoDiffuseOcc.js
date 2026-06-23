var aoDiffuseOcc_default = (
  /* glsl */
  `
void occludeDiffuse(float ao) {
    dDiffuseLight *= ao;
}
`
);
export {
  aoDiffuseOcc_default as default
};
