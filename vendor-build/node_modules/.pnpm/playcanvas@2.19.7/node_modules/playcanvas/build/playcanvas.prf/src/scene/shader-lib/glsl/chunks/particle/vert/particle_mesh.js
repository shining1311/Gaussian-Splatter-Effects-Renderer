var particle_mesh_default = `
	vec3 localPos = meshLocalPos;
	localPos.xy = rotate(localPos.xy, inAngle, rotMatrix);
	localPos.yz = rotate(localPos.yz, inAngle, rotMatrix);
	billboard(particlePos, quadXY);
`;
export {
	particle_mesh_default as default
};
