var lightEvaluation_default = (
  /* glsl */
  `
#if defined(LIGHT{i})
    evaluateLight{i}(
        #if defined(LIT_IRIDESCENCE)
            iridescenceFresnel
        #endif
    );
#endif
`
);
export {
  lightEvaluation_default as default
};
