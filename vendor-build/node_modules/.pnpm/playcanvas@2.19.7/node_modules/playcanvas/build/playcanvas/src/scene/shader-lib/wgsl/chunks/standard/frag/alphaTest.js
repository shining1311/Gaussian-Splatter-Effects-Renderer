var alphaTest_default = `
uniform alpha_ref: f32;
fn alphaTest(a: f32) {
	if (a < uniform.alpha_ref) {
		discard;
	}
}
`;
export {
	alphaTest_default as default
};
