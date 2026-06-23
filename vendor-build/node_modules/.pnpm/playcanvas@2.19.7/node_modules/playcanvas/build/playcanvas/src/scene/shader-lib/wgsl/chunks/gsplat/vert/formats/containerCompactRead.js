var containerCompactRead_default = `
var<private> cachedTransformA: vec4u;
fn getCenter() -> vec3f {
	cachedTransformA = loadDataTransformA();
	return vec3f(bitcast<f32>(cachedTransformA.r), bitcast<f32>(cachedTransformA.g), bitcast<f32>(cachedTransformA.b));
}
fn getOpacity() -> f32 {
	return f32(cachedTransformA.a >> 24u) / 255.0;
}
fn getColor() -> vec3f {
	let data = loadDataColor().x;
	let r = f32(data & 0x7FFu) * (4.0 / 2047.0);
	let g = f32((data >> 11u) & 0x7FFu) * (4.0 / 2047.0);
	let b = f32((data >> 22u) & 0x3FFu) * (4.0 / 1023.0);
	return vec3f(r, g, b);
}
fn getRotation() -> vec4f {
	let data = loadDataTransformB().x;
	let p = vec3f(
		f32(data & 0x7FFu) / 2047.0 * 2.0 - 1.0,
		f32((data >> 11u) & 0x7FFu) / 2047.0 * 2.0 - 1.0,
		f32((data >> 22u) & 0x3FFu) / 1023.0 * 2.0 - 1.0
	);
	let d = dot(p, p);
	return vec4f(1.0 - d, sqrt(max(0.0, 2.0 - d)) * p);
}
fn getScale() -> vec3f {
	let data = cachedTransformA.a;
	let sx = f32(data & 0xFFu);
	let sy = f32((data >> 8u) & 0xFFu);
	let sz = f32((data >> 16u) & 0xFFu);
	let logRange = 21.0 / 255.0;
	let logMin = -12.0;
	return vec3f(
		select(exp(sx * logRange + logMin), 0.0, sx == 0.0),
		select(exp(sy * logRange + logMin), 0.0, sy == 0.0),
		select(exp(sz * logRange + logMin), 0.0, sz == 0.0)
	);
}
`;
export {
	containerCompactRead_default as default
};
