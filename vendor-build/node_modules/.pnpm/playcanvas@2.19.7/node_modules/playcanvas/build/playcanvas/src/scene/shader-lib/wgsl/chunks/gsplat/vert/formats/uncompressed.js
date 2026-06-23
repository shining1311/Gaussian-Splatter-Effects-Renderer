var uncompressed_default = `
var<private> tAw: u32;
var<private> tBcached: vec4f;
fn unpackRotation(data: vec3f) -> vec4f {
	return vec4f(data.xyz, sqrt(max(0.0, 1.0 - dot(data, data))));
}
fn getCenter() -> vec3f {
	let tA: vec4<u32> = loadTransformA();
	tAw = tA.w;
	tBcached = loadTransformB();
	return bitcast<vec3f>(tA.xyz);
}
fn getColor() -> vec4f {
	return loadSplatColor();
}
fn getRotation() -> vec4f {
	return unpackRotation(vec3f(unpack2x16float(tAw), tBcached.w)).wxyz;
}
fn getScale() -> vec3f {
	return tBcached.xyz;
}
#include "gsplatUncompressedSHVS"
`;
export {
	uncompressed_default as default
};
