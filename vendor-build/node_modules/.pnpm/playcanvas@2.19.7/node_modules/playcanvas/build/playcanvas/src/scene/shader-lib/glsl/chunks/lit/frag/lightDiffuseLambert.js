var lightDiffuseLambert_default = `
float getLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDirNorm) {
	return max(dot(worldNormal, -lightDirNorm), 0.0);
}
`;
export {
	lightDiffuseLambert_default as default
};
