var particleUpdaterRespawn_default = `
	if (outLife >= lifetime) {
		outLife -= max(lifetime, numParticles * particleRate);
		visMode = 1.0;
	}
	visMode = outLife < 0.0? 1.0: visMode;
`;
export {
	particleUpdaterRespawn_default as default
};
