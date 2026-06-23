const onesweepScanSource = `
@group(0) @binding(0) var<storage, read> b_globalHist: array<u32>;
@group(0) @binding(1) var<storage, read_write> b_passHist: array<atomic<u32>>;
struct OneSweepScanUniforms {
	threadBlocks: u32,
	_pad0: u32,
	_pad1: u32,
	_pad2: u32
};
@group(0) @binding(2) var<uniform> uniforms: OneSweepScanUniforms;
#ifdef USE_INDIRECT_SORT
@group(0) @binding(3) var<storage, read> b_sortElementCount: array<u32>;
#endif
const RADIX: u32 = 256u;
const FLAG_INCLUSIVE: u32 = 2u;
const PART_SIZE: u32 = {PART_SIZE}u;
const MAX_SUBGROUPS: u32 = {MAX_SUBGROUPS}u;
var<workgroup> g_scan: array<u32, RADIX>;
var<workgroup> sg_totals: array<u32, MAX_SUBGROUPS>;
@compute @workgroup_size(RADIX, 1, 1)
fn main(
	@builtin(local_invocation_index) gtid: u32,
	@builtin(workgroup_id) gid: vec3<u32>,
	@builtin(subgroup_invocation_id) sgInvId: u32,
	@builtin(subgroup_size) sgSize: u32,
) {
	let pass_ = gid.x;
	#ifdef USE_INDIRECT_SORT
	let numKeys = b_sortElementCount[0];
	let threadBlocks = (numKeys + PART_SIZE - 1u) / PART_SIZE;
	#else
	let threadBlocks = uniforms.threadBlocks;
	#endif
	let waveIndex = gtid / sgSize;
	let t = b_globalHist[gtid + pass_ * RADIX];
	let sgExcl = subgroupExclusiveAdd(t);
	let sgTotal = subgroupAdd(t);
	if (sgInvId == 0u) {
		sg_totals[waveIndex] = sgTotal;
	}
	workgroupBarrier();
	if (gtid == 0u) {
		var acc: u32 = 0u;
		for (var i = 0u; i < MAX_SUBGROUPS; i = i + 1u) {
			let v = sg_totals[i];
			sg_totals[i] = acc;
			acc = acc + v;
		}
	}
	workgroupBarrier();
	let excl = sgExcl + sg_totals[waveIndex];
	g_scan[gtid] = excl;
	let dst = pass_ * threadBlocks * RADIX + gtid;
	atomicStore(&b_passHist[dst], (excl << 2u) | FLAG_INCLUSIVE);
}
`;
var onesweep_scan_default = onesweepScanSource;
export {
	onesweep_scan_default as default,
	onesweepScanSource
};
