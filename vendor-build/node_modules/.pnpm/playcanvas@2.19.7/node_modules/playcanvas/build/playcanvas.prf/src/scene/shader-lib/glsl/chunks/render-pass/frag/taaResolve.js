var taaResolve_default = `
	#include  "sampleCatmullRomPS"
	#include  "screenDepthPS"
	uniform sampler2D sourceTexture;
	uniform sampler2D historyTexture;
	uniform mat4 matrix_viewProjectionPrevious;
	uniform mat4 matrix_viewProjectionInverse;
	uniform vec4 jitters;
	uniform vec2 textureSize;
	varying vec2 uv0;
	vec2 reproject(vec2 uv, float depth) {
		depth = depth * 2.0 - 1.0;
		vec4 ndc = vec4(uv * 2.0 - 1.0, depth, 1.0);
		ndc.xy -= jitters.xy;
		vec4 worldPosition = matrix_viewProjectionInverse * ndc;
		worldPosition /= worldPosition.w;
		vec4 screenPrevious = matrix_viewProjectionPrevious * worldPosition;
		return (screenPrevious.xy / screenPrevious.w) * 0.5 + 0.5;
	}
	vec3 colorClampPremul(vec2 uv, vec3 historyPremul) {
		vec3 minPremul = vec3(9999.0);
		vec3 maxPremul = vec3(-9999.0);
		for(float x = -1.0; x <= 1.0; ++x) {
			for(float y = -1.0; y <= 1.0; ++y) {
				vec4 s = texture2D(sourceTexture, uv + vec2(x, y) / textureSize);
				vec3 premul = s.rgb * s.a;
				minPremul = min(minPremul, premul);
				maxPremul = max(maxPremul, premul);
			}
		}
		return clamp(historyPremul, minPremul, maxPremul);
	}
	void main()
	{
		vec4 srcColor = texture2D(sourceTexture, uv0);
		float linearDepth = getLinearScreenDepth(uv0);
		float depth = delinearizeDepth(linearDepth);
		vec2 historyUv = reproject(uv0, depth);
		#ifdef QUALITY_HIGH
			vec4 historySample = SampleTextureCatmullRom(TEXTURE_PASS(historyTexture), historyUv, textureSize);
		#else
			vec4 historySample = texture2D(historyTexture, historyUv);
		#endif
		vec3 historyPremul = historySample.rgb * historySample.a;
		vec3 srcPremul = srcColor.rgb * srcColor.a;
		vec3 historyPremulClamped = colorClampPremul(uv0, historyPremul);
		float mixFactor = (historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0) ?
			1.0 : 0.05;
		vec3 mixedPremul = mix(historyPremulClamped, srcPremul, mixFactor);
		float a = srcColor.a;
		const float UNPREMUL_EPS = 1.0 / 255.0;
		vec3 rgbStraight = (a > UNPREMUL_EPS) ? (mixedPremul / a) : srcColor.rgb;
		gl_FragColor = vec4(rgbStraight, a);
	}
`;
export {
	taaResolve_default as default
};
