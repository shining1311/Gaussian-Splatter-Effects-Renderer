var debug_process_frontend_default = (
  /* glsl */
  `
#ifdef DEBUG_LIGHTING_PASS
litArgs_albedo = vec3(0.5);
#endif

#ifdef DEBUG_UV0_PASS
#ifdef VARYING_VUV0
litArgs_albedo = vec3(vUv0, 0);
#else
litArgs_albedo = vec3(0);
#endif
#endif
`
);
export {
  debug_process_frontend_default as default
};
