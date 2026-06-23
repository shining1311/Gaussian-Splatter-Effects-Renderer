var particle_lambert_default = `
	vec3 negNormal = max(normal, vec3(0.0));
	vec3 posNormal = max(-normal, vec3(0.0));
`;
export {
	particle_lambert_default as default
};
