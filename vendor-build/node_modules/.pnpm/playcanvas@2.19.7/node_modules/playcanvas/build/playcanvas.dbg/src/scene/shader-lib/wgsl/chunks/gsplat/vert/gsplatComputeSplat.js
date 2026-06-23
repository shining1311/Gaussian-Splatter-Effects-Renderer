var gsplatComputeSplat_default = (
  /* wgsl */
  `

struct Splat {
    index: u32,
    uv: vec2i
}

var<private> splat: Splat;

fn setSplat(idx: u32) {
    splat.index = idx;
    splat.uv = vec2i(i32(idx % uniforms.splatTextureSize), i32(idx / uniforms.splatTextureSize));
}

`
);
export {
  gsplatComputeSplat_default as default
};
