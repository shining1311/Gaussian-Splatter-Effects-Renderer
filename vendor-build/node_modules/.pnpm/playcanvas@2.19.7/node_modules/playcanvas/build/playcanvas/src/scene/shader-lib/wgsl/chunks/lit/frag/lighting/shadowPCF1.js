var shadowPCF1_default = `
fn getShadowPCF1x1(shadowMap: texture_depth_2d, shadowMapSampler: sampler_comparison, shadowCoord: vec3f, shadowParams: vec4f) -> f32 {
	return textureSampleCompareLevel(shadowMap, shadowMapSampler, shadowCoord.xy, shadowCoord.z);
}
fn getShadowSpotPCF1x1(shadowMap: texture_depth_2d, shadowMapSampler: sampler_comparison, shadowCoord: vec3f, shadowParams: vec4f) -> f32 {
	return textureSampleCompareLevel(shadowMap, shadowMapSampler, shadowCoord.xy, shadowCoord.z);
}
`;
export {
	shadowPCF1_default as default
};
