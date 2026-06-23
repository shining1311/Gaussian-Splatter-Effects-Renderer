declare const _default: "\nvar {name}: {textureType};\nfn load{funcName}() -> {returnType} { return textureLoad({name}, splat.uv, 0); }\nfn load{funcName}WithIndex(index: u32) -> {returnType} { return textureLoad({name}, vec2i(i32(index % uniform.splatTextureSize), i32(index / uniform.splatTextureSize)), 0); }\n";
export default _default;
