var reflectionCC_default = `
#ifdef LIT_CLEARCOAT
void addReflectionCC(vec3 reflDir, float gloss) {
	ccReflection += calcReflection(reflDir, gloss);
}
#endif
`;
export {
	reflectionCC_default as default
};
