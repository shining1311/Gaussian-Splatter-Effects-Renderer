var gsplatComputeStreamDecl_default = `
@group(0) @binding({binding}) var {name}: {textureType};
fn load{funcName}() -> {returnType} { return textureLoad({name}, splat.uv, 0); }
fn load{funcName}WithIndex(index: u32) -> {returnType} { return textureLoad({name}, vec2i(i32(index % uniforms.splatTextureSize), i32(index / uniforms.splatTextureSize)), 0); }
`;
export {
	gsplatComputeStreamDecl_default as default
};
