var containerCompactWrite_default = `
fn writeSplat(center: vec3f, rotation: vec4f, scale: vec3f, color: vec4f) {
	let rgb = clamp(color.rgb, vec3f(0.0), vec3f(4.0));
	let rBits = u32(rgb.r * (2047.0 / 4.0) + 0.5);
	let gBits = u32(rgb.g * (2047.0 / 4.0) + 0.5);
	let bBits = u32(rgb.b * (1023.0 / 4.0) + 0.5);
	writeDataColor(vec4u(rBits | (gBits << 11u) | (bBits << 22u), 0u, 0u, 0u));
	#ifndef GSPLAT_COLOR_ONLY
		var q = rotation;
		if (q.w < 0.0) { q = -q; }
		let p = q.xyz * inverseSqrt(1.0 + q.w);
		let aBitsQ = u32(clamp(p.x * 0.5 + 0.5, 0.0, 1.0) * 2047.0 + 0.5);
		let bBitsQ = u32(clamp(p.y * 0.5 + 0.5, 0.0, 1.0) * 2047.0 + 0.5);
		let cBitsQ = u32(clamp(p.z * 0.5 + 0.5, 0.0, 1.0) * 1023.0 + 0.5);
		let packedQuat = aBitsQ | (bBitsQ << 11u) | (cBitsQ << 22u);
		let invLogRange = 255.0 / 21.0;
		let logMin = -12.0;
		let sxBits = select(u32(clamp((log(scale.x) - logMin) * invLogRange + 0.5, 1.0, 255.0)), 0u, scale.x < 1e-10);
		let syBits = select(u32(clamp((log(scale.y) - logMin) * invLogRange + 0.5, 1.0, 255.0)), 0u, scale.y < 1e-10);
		let szBits = select(u32(clamp((log(scale.z) - logMin) * invLogRange + 0.5, 1.0, 255.0)), 0u, scale.z < 1e-10);
		let alphaBits = u32(clamp(color.a, 0.0, 1.0) * 255.0 + 0.5);
		let packedScaleAlpha = sxBits | (syBits << 8u) | (szBits << 16u) | (alphaBits << 24u);
		writeDataTransformA(vec4u(bitcast<u32>(center.x), bitcast<u32>(center.y), bitcast<u32>(center.z), packedScaleAlpha));
		writeDataTransformB(vec4u(packedQuat, 0u, 0u, 0u));
	#endif
}
`;
export {
	containerCompactWrite_default as default
};
