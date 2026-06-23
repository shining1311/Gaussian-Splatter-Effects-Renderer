var tonemappingLinear_default = `
vec3 toneMap(vec3 color) {
	return color * getExposure();
}
`;
export {
	tonemappingLinear_default as default
};
