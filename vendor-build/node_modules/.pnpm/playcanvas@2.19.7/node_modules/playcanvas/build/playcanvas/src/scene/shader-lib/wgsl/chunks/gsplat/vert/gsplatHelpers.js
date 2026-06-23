var gsplatHelpers_default = `
fn gsplatMakeSpherical(scale: ptr<function, vec3f>, size: f32) {
	*scale = vec3f(size);
}
fn gsplatGetSizeFromScale(scale: vec3f) -> f32 {
	return sqrt((scale.x * scale.x + scale.y * scale.y + scale.z * scale.z) / 3.0);
}
`;
export {
	gsplatHelpers_default as default
};
