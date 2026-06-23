var compose_color_lut_default = `
	#ifdef COLOR_LUT
		const float COLOR_LUT_N = 16.0;
		const float COLOR_LUT_W = 256.0;
		const float COLOR_LUT_MAX = COLOR_LUT_N - 1.0;
		const float COLOR_LUT_HALF_PX_X = 0.5 / COLOR_LUT_W;
		const float COLOR_LUT_HALF_PX_Y = 0.5 / COLOR_LUT_N;
		const float COLOR_LUT_R_SCALE = COLOR_LUT_MAX / COLOR_LUT_W;
		const float COLOR_LUT_G_SCALE = COLOR_LUT_MAX / COLOR_LUT_N;
		const float COLOR_LUT_SLICE = 1.0 / COLOR_LUT_N;
		uniform vec3 colorLUTParams;
		uniform sampler2D colorLUT;
		#ifdef COLOR_LUT2
			uniform sampler2D colorLUT2;
		#endif
		vec3 sampleColorLUT(sampler2D lut, vec2 uv_l, vec2 uv_h, float t) {
			vec3 color_l = texture2DLod(lut, uv_l, 0.0).rgb;
			vec3 color_h = texture2DLod(lut, uv_h, 0.0).rgb;
			return mix(color_l, color_h, t);
		}
		vec3 applyColorLUT(vec3 color) {
			vec3 srgbCoord = pow(max(color, vec3(0.0)) + 0.0000001, vec3(1.0 / 2.2));
			vec3 c = clamp(srgbCoord, 0.0, 1.0);
			float cell = c.b * COLOR_LUT_MAX;
			float cell_l = floor(cell);
			float cell_h = ceil(cell);
			float t = fract(cell);
			float r_offset = COLOR_LUT_HALF_PX_X + c.r * COLOR_LUT_R_SCALE;
			float g_offset = COLOR_LUT_HALF_PX_Y + c.g * COLOR_LUT_G_SCALE;
			vec2 uv_l = vec2(cell_l * COLOR_LUT_SLICE + r_offset, g_offset);
			vec2 uv_h = vec2(cell_h * COLOR_LUT_SLICE + r_offset, g_offset);
			vec3 lut1 = sampleColorLUT(colorLUT, uv_l, uv_h, t);
			#ifdef COLOR_LUT2
				vec3 lut2 = sampleColorLUT(colorLUT2, uv_l, uv_h, t);
				float w1 = colorLUTParams.x * (1.0 - colorLUTParams.z);
				float w2 = colorLUTParams.y * colorLUTParams.z;
				return color + (lut1 - color) * w1 + (lut2 - color) * w2;
			#else
				return mix(color, lut1, colorLUTParams.x);
			#endif
		}
	#endif
`;
export {
	compose_color_lut_default as default
};
