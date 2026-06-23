var lightDirPoint_default = (
  /* glsl */
  `
vec3 evalOmniLight(vec3 lightPosW) {
    return vPositionW - lightPosW;
}
`
);
export {
  lightDirPoint_default as default
};
