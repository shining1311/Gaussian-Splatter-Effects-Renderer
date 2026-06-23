var quad_default = (
  /* glsl */
  `
    attribute vec2 aPosition;
    varying vec2 uv0;
    void main(void)
    {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        uv0 = getImageEffectUV((aPosition.xy + 1.0) * 0.5);
    }
`
);
export {
  quad_default as default
};
