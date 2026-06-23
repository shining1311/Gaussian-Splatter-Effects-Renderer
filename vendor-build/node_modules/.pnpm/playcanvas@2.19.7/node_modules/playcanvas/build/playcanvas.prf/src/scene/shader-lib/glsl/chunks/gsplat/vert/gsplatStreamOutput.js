var gsplatStreamOutput_default = `
void write{funcName}({returnType} value) {
#if {defineGuard}
	pcFragColor{index} = value;
#endif
}
`;
export {
	gsplatStreamOutput_default as default
};
