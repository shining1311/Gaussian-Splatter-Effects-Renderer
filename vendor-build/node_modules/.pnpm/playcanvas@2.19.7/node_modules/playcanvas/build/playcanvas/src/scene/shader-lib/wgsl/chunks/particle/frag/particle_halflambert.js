var particle_halflambert_default = `
	var negNormal: vec3f = normal * 0.5 + 0.5;
	var posNormal: vec3f = -normal * 0.5 + 0.5;
	negNormal = negNormal * negNormal;
	posNormal = posNormal * posNormal;
`;
export {
	particle_halflambert_default as default
};
