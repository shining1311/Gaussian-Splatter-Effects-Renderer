var gsplatStreamDecl_default = `
uniform highp {sampler} {name};
{returnType} load{funcName}() { return texelFetch({name}, splat.uv, 0); }
{returnType} load{funcName}WithIndex(uint index) { return texelFetch({name}, ivec2(index % splatTextureSize, index / splatTextureSize), 0); }
`;
export {
	gsplatStreamDecl_default as default
};
