var gsplatStreamDecl_default = `
var {name}: {textureType};
fn load{funcName}() -> {returnType} { return textureLoad({name}, splat.uv, 0); }
fn load{funcName}WithIndex(index: u32) -> {returnType} { return textureLoad({name}, vec2i(i32(index % uniform.splatTextureSize), i32(index / uniform.splatTextureSize)), 0); }
`;
export {
	gsplatStreamDecl_default as default
};
