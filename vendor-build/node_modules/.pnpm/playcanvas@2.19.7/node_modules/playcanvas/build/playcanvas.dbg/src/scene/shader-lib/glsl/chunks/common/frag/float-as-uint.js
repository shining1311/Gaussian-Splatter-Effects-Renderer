var float_as_uint_default = (
  /* glsl */
  `

#ifndef FLOAT_AS_UINT
#define FLOAT_AS_UINT

// encode float value to RGBA8
vec4 float2uint(float value) {
    uint intBits = floatBitsToUint(value);
    return vec4(
        float((intBits >> 24u) & 0xFFu) / 255.0,
        float((intBits >> 16u) & 0xFFu) / 255.0,
        float((intBits >> 8u) & 0xFFu) / 255.0,
        float(intBits & 0xFFu) / 255.0
    );
}

// decode RGBA8 value to float
float uint2float(vec4 value) {
    uint intBits = 
        (uint(value.r * 255.0) << 24u) |
        (uint(value.g * 255.0) << 16u) |
        (uint(value.b * 255.0) << 8u) |
        uint(value.a * 255.0);

    return uintBitsToFloat(intBits);
}

// store a single float value in vec4, assuming either RGBA8 or float renderable texture
vec4 float2vec4(float value) {
    #if defined(CAPS_TEXTURE_FLOAT_RENDERABLE)
        return vec4(value, 1.0, 1.0, 1.0);
    #else
        return float2uint(value);
    #endif
}

#endif // FLOAT_AS_UINT
`
);
export {
  float_as_uint_default as default
};
