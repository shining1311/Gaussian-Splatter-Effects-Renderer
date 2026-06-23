var fresnelSchlick_default = `
fn pow5(x: f32) -> f32 {
	let x2: f32 = x * x;
	return x2 * x2 * x;
}
fn getFresnel(
		cosTheta: f32,
		gloss: f32,
		specularity: vec3f
	#if defined(LIT_IRIDESCENCE)
		, iridescenceFresnel: vec3f,
		iridescenceIntensity: f32
	#endif
) -> vec3f {
	let fresnel: f32 = pow5(1.0 - saturate(cosTheta));
	let glossSq: f32 = gloss * gloss;
	let specIntensity: f32 = max(specularity.r, max(specularity.g, specularity.b));
	let ret: vec3f = specularity + (max(vec3f(glossSq * specIntensity), specularity) - specularity) * fresnel;
	#if defined(LIT_IRIDESCENCE)
		return mix(ret, iridescenceFresnel, iridescenceIntensity);
	#else
		return ret;
	#endif
}
fn getFresnelCC(cosTheta: f32) -> f32 {
	let fresnel: f32 = pow5(1.0 - saturate(cosTheta));
	return 0.04 + (1.0 - 0.04) * fresnel;
}`;
export {
	fresnelSchlick_default as default
};
