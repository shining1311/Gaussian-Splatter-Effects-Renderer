declare const _default: "\n\nstruct Splat {\n    index: u32,\n    uv: vec2i\n}\n\nvar<private> splat: Splat;\n\nfn setSplat(idx: u32) {\n    splat.index = idx;\n    splat.uv = vec2i(i32(idx % uniforms.splatTextureSize), i32(idx / uniforms.splatTextureSize));\n}\n\n";
export default _default;
