var outputTex2D_default = (
  /* glsl */
  `
varying vec2 vUv0;

uniform sampler2D source;

void main(void) {
    gl_FragColor = texture2D(source, vUv0);
}
`
);
export {
  outputTex2D_default as default
};
