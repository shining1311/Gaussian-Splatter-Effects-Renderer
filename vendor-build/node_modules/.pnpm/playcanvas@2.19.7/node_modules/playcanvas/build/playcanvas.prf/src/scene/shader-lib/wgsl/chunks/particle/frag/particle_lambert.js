var particle_lambert_default = `
	var negNormal: vec3f = max(normal, vec3(0.0));
	var posNormal: vec3f = max(-normal, vec3(0.0));
`;
export {
	particle_lambert_default as default
};
