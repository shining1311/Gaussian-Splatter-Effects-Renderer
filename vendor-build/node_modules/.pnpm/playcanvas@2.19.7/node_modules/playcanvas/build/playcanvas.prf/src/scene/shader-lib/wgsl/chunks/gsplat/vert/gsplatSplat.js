var gsplatSplat_default = `
struct Splat {
	index: u32,
	uv: vec2i
}
var<private> splat: Splat;
fn setSplat(idx: u32) {
	splat.index = idx;
	splat.uv = vec2i(i32(idx % uniform.splatTextureSize), i32(idx / uniform.splatTextureSize));
}
`;
export {
	gsplatSplat_default as default
};
