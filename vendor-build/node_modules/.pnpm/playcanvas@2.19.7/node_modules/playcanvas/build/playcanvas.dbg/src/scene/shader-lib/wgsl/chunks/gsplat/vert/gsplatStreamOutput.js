var gsplatStreamOutput_default = (
  /* wgsl */
  `
fn write{funcName}(value: {returnType}) {
#if {defineGuard}
    processOutput.{colorSlot} = value;
#endif
}
`
);
export {
  gsplatStreamOutput_default as default
};
