var fresnelSchlick_default = `
float pow5(float x) {
	float x2 = x * x;
	return x2 * x2 * x;
}
vec3 getFresnel(
		float cosTheta, 
		float gloss, 
		vec3 specularity
#if defined(LIT_IRIDESCENCE)
		, vec3 iridescenceFresnel, 
		float iridescenceIntensity
#endif
	) {
	float fresnel = pow5(1.0 - saturate(cosTheta));
	float glossSq = gloss * gloss;
	float specIntensity = max(specularity.r, max(specularity.g, specularity.b));
	vec3 ret = specularity + (max(vec3(glossSq * specIntensity), specularity) - specularity) * fresnel;
#if defined(LIT_IRIDESCENCE)
	return mix(ret, iridescenceFresnel, iridescenceIntensity);
#else
	return ret;
#endif	
}
float getFresnelCC(float cosTheta) {
	float fresnel = pow5(1.0 - saturate(cosTheta));
	return 0.04 + (1.0 - 0.04) * fresnel;
}
`;
export {
	fresnelSchlick_default as default
};
