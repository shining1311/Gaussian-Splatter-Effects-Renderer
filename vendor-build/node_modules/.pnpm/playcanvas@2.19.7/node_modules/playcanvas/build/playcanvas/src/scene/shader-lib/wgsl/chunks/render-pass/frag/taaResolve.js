var taaResolve_default = `
	#include "sampleCatmullRomPS"
	#include "screenDepthPS"
	var sourceTexture: texture_2d<f32>;
	var sourceTextureSampler: sampler;
	var historyTexture: texture_2d<f32>;
	var historyTextureSampler: sampler;
	uniform matrix_viewProjectionPrevious: mat4x4f;
	uniform matrix_viewProjectionInverse: mat4x4f;
	uniform jitters: vec4f;
	uniform textureSize: vec2f;
	varying uv0: vec2f;
	fn reproject(uv_in: vec2f, depth: f32) -> vec2f {
		var uv = vec2f(uv_in.x, 1.0 - uv_in.y);
		var ndc = vec4f(uv * 2.0 - 1.0, depth, 1.0);
		ndc = vec4f(ndc.xy - uniform.jitters.xy, ndc.zw);
		var worldPosition = uniform.matrix_viewProjectionInverse * ndc;
		worldPosition = worldPosition / worldPosition.w;
		let screenPrevious = uniform.matrix_viewProjectionPrevious * worldPosition;
		var result = (screenPrevious.xy / screenPrevious.w) * 0.5 + 0.5;
		result.y = 1.0 - result.y;
		return result;
	}
	fn colorClampPremul(uv: vec2f, historyPremul: vec3f) -> vec3f {
		var minPremul = vec3f(9999.0);
		var maxPremul = vec3f(-9999.0);
		for (var ix: i32 = -1; ix <= 1; ix = ix + 1) {
			for (var iy: i32 = -1; iy <= 1; iy = iy + 1) {
				let s = textureSample(sourceTexture, sourceTextureSampler, uv + vec2f(f32(ix), f32(iy)) / uniform.textureSize);
				let premul = s.rgb * s.a;
				minPremul = min(minPremul, premul);
				maxPremul = max(maxPremul, premul);
			}
		}
		return clamp(historyPremul, minPremul, maxPremul);
	}
	@fragment
	fn fragmentMain(input: FragmentInput) -> FragmentOutput {
		var output: FragmentOutput;
		let srcColor = textureSample(sourceTexture, sourceTextureSampler, uv0);
		let linearDepth = getLinearScreenDepth(uv0);
		let depth = delinearizeDepth(linearDepth);
		let historyUv = reproject(uv0, depth);
		#ifdef QUALITY_HIGH
			var historySample: vec4f = SampleTextureCatmullRom(historyTexture, historyTextureSampler, historyUv, uniform.textureSize);
		#else
			var historySample: vec4f = textureSample(historyTexture, historyTextureSampler, historyUv);
		#endif
		let historyPremul = historySample.rgb * historySample.a;
		let srcPremul = srcColor.rgb * srcColor.a;
		let historyPremulClamped = colorClampPremul(uv0, historyPremul);
		let mixFactor_condition = historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0;
		let mixFactor = select(0.05, 1.0, mixFactor_condition);
		let mixedPremul = mix(historyPremulClamped, srcPremul, mixFactor);
		let a = srcColor.a;
		let UNPREMUL_EPS = 1.0 / 255.0;
		let rgbStraight = select(srcColor.rgb, mixedPremul / a, a > UNPREMUL_EPS);
		output.color = vec4f(rgbStraight, a);
		return output;
	}
`;
export {
	taaResolve_default as default
};
