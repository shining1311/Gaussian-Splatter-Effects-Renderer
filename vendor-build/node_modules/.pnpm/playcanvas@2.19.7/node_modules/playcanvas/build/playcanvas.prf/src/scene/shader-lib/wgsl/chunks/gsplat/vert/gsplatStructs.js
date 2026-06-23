var gsplatStructs_default = `
#include "gsplatSplatVS"
struct SplatSource {
	order: u32,
	cornerUV: half2
}
struct SplatCenter {
	view: vec3f,
	proj: vec4f,
	modelView: mat4x4f,
	projMat00: f32,
	modelCenterOriginal: vec3f,
	modelCenterModified: vec3f,
	#ifdef GSPLAT_FISHEYE
		fisheyeSinTK: f32,
		fisheyeCosTK: f32,
		fisheyeRxy: f32,
	#endif
}
struct SplatCorner {
	offset: vec3f,
	uv: half2,
	#if GSPLAT_AA
		aaFactor: half,
	#endif
}
`;
export {
	gsplatStructs_default as default
};
