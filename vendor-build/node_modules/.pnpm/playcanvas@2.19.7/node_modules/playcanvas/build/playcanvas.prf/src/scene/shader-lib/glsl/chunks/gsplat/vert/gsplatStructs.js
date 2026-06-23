var gsplatStructs_default = `
#include "gsplatSplatVS"
struct SplatSource {
	uint order;
	vec2 cornerUV;
};
struct SplatCenter {
	vec3 view;
	vec4 proj;
	mat4 modelView;
	float projMat00;
	vec3 modelCenterOriginal;
	vec3 modelCenterModified;
	#ifdef GSPLAT_FISHEYE
		float fisheyeSinTK;
		float fisheyeCosTK;
		float fisheyeRxy;
	#endif
};
struct SplatCorner {
	vec3 offset;
	vec2 uv;
	#if GSPLAT_AA
		float aaFactor;
	#endif
	vec2 v;
	float dlen;
};
`;
export {
	gsplatStructs_default as default
};
