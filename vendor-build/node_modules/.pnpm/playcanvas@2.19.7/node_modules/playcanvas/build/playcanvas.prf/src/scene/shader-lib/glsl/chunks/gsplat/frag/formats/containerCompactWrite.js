var containerCompactWrite_default = `
void writeSplat(vec3 center, vec4 rotation, vec3 scale, vec4 color) {
	vec3 rgb = clamp(color.rgb, 0.0, 4.0);
	uint rBits = uint(rgb.r * (2047.0 / 4.0) + 0.5);
	uint gBits = uint(rgb.g * (2047.0 / 4.0) + 0.5);
	uint bBits = uint(rgb.b * (1023.0 / 4.0) + 0.5);
	writeDataColor(uvec4(rBits | (gBits << 11u) | (bBits << 22u), 0u, 0u, 0u));
	#ifndef GSPLAT_COLOR_ONLY
		vec4 q = rotation;
		if (q.w < 0.0) q = -q;
		vec3 p = q.xyz * inversesqrt(1.0 + q.w);
		uint aBitsQ = uint(clamp((p.x * 0.5 + 0.5) * 2047.0 + 0.5, 0.0, 2047.0));
		uint bBitsQ = uint(clamp((p.y * 0.5 + 0.5) * 2047.0 + 0.5, 0.0, 2047.0));
		uint cBitsQ = uint(clamp((p.z * 0.5 + 0.5) * 1023.0 + 0.5, 0.0, 1023.0));
		uint packedQuat = aBitsQ | (bBitsQ << 11u) | (cBitsQ << 22u);
		const float invLogRange = 255.0 / 21.0;
		const float logMin = -12.0;
		uint sxBits = scale.x < 1e-10 ? 0u : uint(clamp((log(scale.x) - logMin) * invLogRange + 0.5, 1.0, 255.0));
		uint syBits = scale.y < 1e-10 ? 0u : uint(clamp((log(scale.y) - logMin) * invLogRange + 0.5, 1.0, 255.0));
		uint szBits = scale.z < 1e-10 ? 0u : uint(clamp((log(scale.z) - logMin) * invLogRange + 0.5, 1.0, 255.0));
		uint alphaBits = uint(clamp(color.a, 0.0, 1.0) * 255.0 + 0.5);
		uint packedScaleAlpha = sxBits | (syBits << 8u) | (szBits << 16u) | (alphaBits << 24u);
		writeDataTransformA(uvec4(floatBitsToUint(center.x), floatBitsToUint(center.y), floatBitsToUint(center.z), packedScaleAlpha));
		writeDataTransformB(uvec4(packedQuat, 0u, 0u, 0u));
	#endif
}
`;
export {
	containerCompactWrite_default as default
};
