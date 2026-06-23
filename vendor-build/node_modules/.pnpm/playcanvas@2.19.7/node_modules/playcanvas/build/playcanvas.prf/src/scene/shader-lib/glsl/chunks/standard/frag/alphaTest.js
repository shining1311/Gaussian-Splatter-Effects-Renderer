var alphaTest_default = `
uniform float alpha_ref;
void alphaTest(float a) {
	if (a < alpha_ref) discard;
}
`;
export {
	alphaTest_default as default
};
