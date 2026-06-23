var particle_normal_default = `
	Normal = normalize(localPos + matrix_viewInverse[2].xyz);
`;
export {
	particle_normal_default as default
};
