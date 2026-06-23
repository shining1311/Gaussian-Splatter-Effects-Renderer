var uncompressed_default = (
  /* glsl */
  `

// work values
uint tAw;
vec4 tBcached;

vec4 unpackRotation(vec3 data) {
    return vec4(data.xyz, sqrt(max(0.0, 1.0 - dot(data, data))));
}

// read the model-space center of the gaussian
vec3 getCenter() {
    // read transform data using generated load functions (use global splat.uv)
    uvec4 tA = loadTransformA();
    tAw = tA.w;
    tBcached = loadTransformB();
    return uintBitsToFloat(tA.xyz);
}

vec4 getColor() {
    return loadSplatColor();
}

vec4 getRotation() {
    return unpackRotation(vec3(unpackHalf2x16(tAw), tBcached.w)).wxyz;
}

vec3 getScale() {
    return tBcached.xyz;
}

#include "gsplatUncompressedSHVS"
`
);
export {
  uncompressed_default as default
};
