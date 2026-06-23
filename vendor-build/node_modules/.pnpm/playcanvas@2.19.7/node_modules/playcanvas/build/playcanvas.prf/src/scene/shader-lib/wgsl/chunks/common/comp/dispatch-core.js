var dispatch_core_default = `
fn calcDispatch2D(count: u32, maxDim: u32) -> vec2u {
	if (count <= maxDim) {
		return vec2u(count, 1u);
	}
	let y = (count + maxDim - 1u) / maxDim;
	let x = (count + y - 1u) / y;
	return vec2u(x, y);
}
`;
export {
	dispatch_core_default as default
};
