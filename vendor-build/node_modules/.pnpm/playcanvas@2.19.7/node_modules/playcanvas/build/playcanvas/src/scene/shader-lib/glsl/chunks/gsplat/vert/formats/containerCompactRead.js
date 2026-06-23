var containerCompactRead_default = `
uvec4 cachedTransformA;
vec3 getCenter() {
	cachedTransformA = loadDataTransformA();
	return vec3(uintBitsToFloat(cachedTransformA.r), uintBitsToFloat(cachedTransformA.g), uintBitsToFloat(cachedTransformA.b));
}
float getOpacity() {
	return float(cachedTransformA.a >> 24u) / 255.0;
}
vec3 getColor() {
	uint data = loadDataColor().x;
	float r = float(data & 0x7FFu) * (4.0 / 2047.0);
	float g = float((data >> 11u) & 0x7FFu) * (4.0 / 2047.0);
	float b = float((data >> 22u) & 0x3FFu) * (4.0 / 1023.0);
	return vec3(r, g, b);
}
vec4 getRotation() {
	uint data = loadDataTransformB().x;
	vec3 p = vec3(
		float(data & 0x7FFu) / 2047.0 * 2.0 - 1.0,
		float((data >> 11u) & 0x7FFu) / 2047.0 * 2.0 - 1.0,
		float((data >> 22u) & 0x3FFu) / 1023.0 * 2.0 - 1.0
	);
	float d = dot(p, p);
	return vec4(1.0 - d, sqrt(max(0.0, 2.0 - d)) * p);
}
vec3 getScale() {
	uint data = cachedTransformA.a;
	float sx = float(data & 0xFFu);
	float sy = float((data >> 8u) & 0xFFu);
	float sz = float((data >> 16u) & 0xFFu);
	const float logRange = 21.0 / 255.0;
	const float logMin = -12.0;
	return vec3(
		sx == 0.0 ? 0.0 : exp(sx * logRange + logMin),
		sy == 0.0 ? 0.0 : exp(sy * logRange + logMin),
		sz == 0.0 ? 0.0 : exp(sz * logRange + logMin)
	);
}
`;
export {
	containerCompactRead_default as default
};
