declare const _default: "\n@group(0) @binding({binding}) var {name}: {textureType};\nfn load{funcName}() -> {returnType} { return textureLoad({name}, splat.uv, 0); }\nfn load{funcName}WithIndex(index: u32) -> {returnType} { return textureLoad({name}, vec2i(i32(index % uniforms.splatTextureSize), i32(index / uniforms.splatTextureSize)), 0); }\n";
export default _default;
