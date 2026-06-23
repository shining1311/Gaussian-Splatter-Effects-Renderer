var particle_soft_default = `
	float depth = getLinearScreenDepth();
	float particleDepth = vDepth;
	float depthDiff = saturate(abs(particleDepth - depth) * softening);
	a *= depthDiff;
`;
export {
	particle_soft_default as default
};
