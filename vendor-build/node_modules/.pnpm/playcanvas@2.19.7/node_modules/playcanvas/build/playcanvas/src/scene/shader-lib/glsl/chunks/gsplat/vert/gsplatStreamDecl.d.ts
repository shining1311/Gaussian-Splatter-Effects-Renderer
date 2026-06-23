declare const _default: "\nuniform highp {sampler} {name};\n{returnType} load{funcName}() { return texelFetch({name}, splat.uv, 0); }\n{returnType} load{funcName}WithIndex(uint index) { return texelFetch({name}, ivec2(index % splatTextureSize, index / splatTextureSize), 0); }\n";
export default _default;
