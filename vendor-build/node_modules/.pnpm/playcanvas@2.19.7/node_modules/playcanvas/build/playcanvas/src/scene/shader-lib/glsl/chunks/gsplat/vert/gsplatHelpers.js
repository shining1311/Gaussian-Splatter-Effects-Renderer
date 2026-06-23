var gsplatHelpers_default = `
void gsplatMakeSpherical(inout vec3 scale, float size) {
	scale = vec3(size);
}
float gsplatGetSizeFromScale(vec3 scale) {
	return sqrt((scale.x * scale.x + scale.y * scale.y + scale.z * scale.z) / 3.0);
}
`;
export {
	gsplatHelpers_default as default
};
