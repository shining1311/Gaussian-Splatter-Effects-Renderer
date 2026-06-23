var half_types_default = `
#ifdef CAPS_SHADER_F16
	alias half = f16;
	alias half2 = vec2<f16>;
	alias half3 = vec3<f16>;
	alias half4 = vec4<f16>;
	alias half2x2 = mat2x2<f16>;
	alias half3x3 = mat3x3<f16>;
	alias half4x4 = mat4x4<f16>;
#else
	alias half = f32;
	alias half2 = vec2f;
	alias half3 = vec3f;
	alias half4 = vec4f;
	alias half2x2 = mat2x2f;
	alias half3x3 = mat3x3f;
	alias half4x4 = mat4x4f;
#endif
`;
export {
	half_types_default as default
};
