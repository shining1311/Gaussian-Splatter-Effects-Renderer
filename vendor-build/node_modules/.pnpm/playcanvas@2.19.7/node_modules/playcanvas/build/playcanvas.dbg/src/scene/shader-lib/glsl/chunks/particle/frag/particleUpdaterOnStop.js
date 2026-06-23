var particleUpdaterOnStop_default = (
  /* glsl */
  `
    visMode = outLife < 0.0? -1.0: visMode;
`
);
export {
  particleUpdaterOnStop_default as default
};
