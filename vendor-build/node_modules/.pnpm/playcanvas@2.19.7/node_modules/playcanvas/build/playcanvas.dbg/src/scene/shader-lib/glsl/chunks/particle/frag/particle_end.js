var particle_end_default = (
  /* glsl */
  `
    rgb = addFog(rgb);
    rgb = toneMap(rgb);
    rgb = gammaCorrectOutput(rgb);
    gl_FragColor = vec4(rgb, a);
}
`
);
export {
  particle_end_default as default
};
