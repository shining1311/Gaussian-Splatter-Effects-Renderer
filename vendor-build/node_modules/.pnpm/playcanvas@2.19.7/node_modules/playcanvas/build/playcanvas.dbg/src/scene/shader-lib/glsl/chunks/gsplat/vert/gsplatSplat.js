var gsplatSplat_default = (
  /* glsl */
  `

// Splat identification for texture sampling
struct Splat {
    uint index;     // linear index into splat data
    ivec2 uv;       // texture coordinate for sampling
};

// Global splat instance used by format read functions and load functions
Splat splat;

// Initialize splat from linear index
void setSplat(uint idx) {
    splat.index = idx;
    splat.uv = ivec2(idx % splatTextureSize, idx / splatTextureSize);
}

`
);
export {
  gsplatSplat_default as default
};
