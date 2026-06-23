var sort_indirect_args_default = `
fn writeSortIndirectArgs(
	baseSlot: u32,
	count: u32,
	slotInfo: vec4<u32>
) {
	let n = slotInfo.x;
	if (n >= 1u) {
		let g = slotInfo.y;
		let wc = (count + g - 1u) / g;
		let off = baseSlot * 3u;
		indirectDispatchArgs[off + 0u] = wc;
		indirectDispatchArgs[off + 1u] = 1u;
		indirectDispatchArgs[off + 2u] = 1u;
	}
	if (n >= 2u) {
		let g = slotInfo.z;
		let wc = (count + g - 1u) / g;
		let off = (baseSlot + 1u) * 3u;
		indirectDispatchArgs[off + 0u] = wc;
		indirectDispatchArgs[off + 1u] = 1u;
		indirectDispatchArgs[off + 2u] = 1u;
	}
	if (n >= 3u) {
		let g = slotInfo.w;
		let wc = (count + g - 1u) / g;
		let off = (baseSlot + 2u) * 3u;
		indirectDispatchArgs[off + 0u] = wc;
		indirectDispatchArgs[off + 1u] = 1u;
		indirectDispatchArgs[off + 2u] = 1u;
	}
}
`;
export {
	sort_indirect_args_default as default
};
