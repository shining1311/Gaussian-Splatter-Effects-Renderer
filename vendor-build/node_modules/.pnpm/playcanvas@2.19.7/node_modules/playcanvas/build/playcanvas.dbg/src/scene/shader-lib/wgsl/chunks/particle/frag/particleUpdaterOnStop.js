var particleUpdaterOnStop_default = (
  /* wgsl */
  `
    visMode = select(visMode, -1.0, outLife < 0.0);
`
);
export {
  particleUpdaterOnStop_default as default
};
