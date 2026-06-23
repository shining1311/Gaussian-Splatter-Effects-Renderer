var reflectionCC_default = (
  /* wgsl */
  `
#ifdef LIT_CLEARCOAT
fn addReflectionCC(reflDir: vec3f, gloss: f32) {
    ccReflection = ccReflection + calcReflection(reflDir, gloss);
}
#endif
`
);
export {
  reflectionCC_default as default
};
