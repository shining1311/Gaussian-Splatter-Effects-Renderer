var twoSidedLighting_default = `
fn handleTwoSidedLighting() {
	if (!pcFrontFacing) { dTBN[2] = -dTBN[2]; }
}
`;
export {
	twoSidedLighting_default as default
};
