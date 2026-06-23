var compose_color_lut_default = `
	#ifdef COLOR_LUT
		const COLOR_LUT_N: f32 = 16.0;
		const COLOR_LUT_W: f32 = 256.0;
		const COLOR_LUT_MAX: f32 = COLOR_LUT_N - 1.0;
		const COLOR_LUT_HALF_PX_X: f32 = 0.5 / COLOR_LUT_W;
		const COLOR_LUT_HALF_PX_Y: f32 = 0.5 / COLOR_LUT_N;
		const COLOR_LUT_R_SCALE: f32 = COLOR_LUT_MAX / COLOR_LUT_W;
		const COLOR_LUT_G_SCALE: f32 = COLOR_LUT_MAX / COLOR_LUT_N;
		const COLOR_LUT_SLICE: f32 = 1.0 / COLOR_LUT_N;
		uniform colorLUTParams: vec3f;
		var colorLUT: texture_2d<f32>;
		var colorLUTSampler: sampler;
		#ifdef COLOR_LUT2
			var colorLUT2: texture_2d<f32>;
			var colorLUT2Sampler: sampler;
		#endif
		fn sampleColorLUT(lut: texture_2d<f32>, lutSampler: sampler, uv_l: vec2f, uv_h: vec2f, t: f32) -> vec3f {
			let color_l: vec3f = textureSampleLevel(lut, lutSampler, uv_l, 0.0).rgb;
			let color_h: vec3f = textureSampleLevel(lut, lutSampler, uv_h, 0.0).rgb;
			return mix(color_l, color_h, vec3f(t));
		}
		fn applyColorLUT(color: vec3f) -> vec3f {
			let srgbCoord: vec3f = pow(max(color, vec3f(0.0)) + vec3f(0.0000001), vec3f(1.0 / 2.2));
			let c: vec3f = clamp(srgbCoord, vec3f(0.0), vec3f(1.0));
			let cell: f32 = c.b * COLOR_LUT_MAX;
			let cell_l: f32 = floor(cell);
			let cell_h: f32 = ceil(cell);
			let t: f32 = fract(cell);
			let r_offset: f32 = COLOR_LUT_HALF_PX_X + c.r * COLOR_LUT_R_SCALE;
			let g_offset: f32 = COLOR_LUT_HALF_PX_Y + c.g * COLOR_LUT_G_SCALE;
			let uv_l: vec2f = vec2f(cell_l * COLOR_LUT_SLICE + r_offset, g_offset);
			let uv_h: vec2f = vec2f(cell_h * COLOR_LUT_SLICE + r_offset, g_offset);
			let lut1: vec3f = sampleColorLUT(colorLUT, colorLUTSampler, uv_l, uv_h, t);
			#ifdef COLOR_LUT2
				let lut2: vec3f = sampleColorLUT(colorLUT2, colorLUT2Sampler, uv_l, uv_h, t);
				let w1: f32 = uniform.colorLUTParams.x * (1.0 - uniform.colorLUTParams.z);
				let w2: f32 = uniform.colorLUTParams.y * uniform.colorLUTParams.z;
				return color + (lut1 - color) * w1 + (lut2 - color) * w2;
			#else
				return mix(color, lut1, vec3f(uniform.colorLUTParams.x));
			#endif
		}
	#endif
`;
export {
	compose_color_lut_default as default
};
