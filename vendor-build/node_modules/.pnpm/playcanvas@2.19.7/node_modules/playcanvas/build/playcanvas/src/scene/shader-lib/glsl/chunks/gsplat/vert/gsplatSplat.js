var gsplatSplat_default = `
struct Splat {
	uint index;
	ivec2 uv;
};
Splat splat;
void setSplat(uint idx) {
	splat.index = idx;
	splat.uv = ivec2(idx % splatTextureSize, idx / splatTextureSize);
}
`;
export {
	gsplatSplat_default as default
};
