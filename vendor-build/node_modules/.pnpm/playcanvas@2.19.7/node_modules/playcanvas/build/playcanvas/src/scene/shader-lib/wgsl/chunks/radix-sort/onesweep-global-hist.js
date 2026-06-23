const onesweepGlobalHistSource = `
@group(0) @binding(0) var<storage, read> b_sort: array<vec4<u32>>;
@group(0) @binding(1) var<storage, read_write> b_globalHist: array<atomic<u32>>;
struct OneSweepUniforms {
	numKeys: u32,
	threadBlocks: u32,
	numPasses: u32,
	_pad: u32
};
@group(0) @binding(2) var<uniform> uniforms: OneSweepUniforms;
#ifdef USE_INDIRECT_SORT
@group(0) @binding(3) var<storage, read> b_sortElementCount: array<u32>;
#endif
const RADIX: u32 = 256u;
const MAX_PASSES: u32 = 4u;
const G_HIST_DIM: u32 = {G_HIST_DIM}u;
const G_HIST_PART_SIZE: u32 = {G_HIST_PART_SIZE}u;
const G_HIST_PART_SIZE_VEC: u32 = G_HIST_PART_SIZE / 4u;
const SHARED_HIST_SIZE: u32 = 2u * MAX_PASSES * RADIX;
var<workgroup> g_gHist: array<atomic<u32>, SHARED_HIST_SIZE>;
fn histOffset(row: u32, pass_: u32) -> u32 {
	return row * RADIX + pass_ * 2u * RADIX;
}
@compute @workgroup_size(G_HIST_DIM, 1, 1)
fn main(
	@builtin(local_invocation_index) gtid: u32,
	@builtin(workgroup_id) gid: vec3<u32>,
	@builtin(num_workgroups) nwg: vec3<u32>,
) {
	let flatGid = gid.x + gid.y * nwg.x;
	let numPasses = uniforms.numPasses;
	#ifdef USE_INDIRECT_SORT
		let numKeys = b_sortElementCount[0];
	#else
		let numKeys = uniforms.numKeys;
	#endif
	let sharedEnd = 2u * numPasses * RADIX;
	for (var i = gtid; i < sharedEnd; i = i + G_HIST_DIM) {
		atomicStore(&g_gHist[i], 0u);
	}
	workgroupBarrier();
	let row = gtid / 64u;
	let numKeysVecFull = numKeys >> 2u;
	let partitionStartVec = flatGid * G_HIST_PART_SIZE_VEC;
	let partitionEndVec = min(partitionStartVec + G_HIST_PART_SIZE_VEC, numKeysVecFull);
	for (var i = partitionStartVec + gtid; i < partitionEndVec; i = i + G_HIST_DIM) {
		let q = b_sort[i];
		if (numPasses >= 1u) {
			let off = histOffset(row, 0u);
			atomicAdd(&g_gHist[(q.x		 & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[(q.y		 & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[(q.z		 & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[(q.w		 & 0xFFu) + off], 1u);
		}
		if (numPasses >= 2u) {
			let off = histOffset(row, 1u);
			atomicAdd(&g_gHist[((q.x >>  8u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.y >>  8u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.z >>  8u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.w >>  8u) & 0xFFu) + off], 1u);
		}
		if (numPasses >= 3u) {
			let off = histOffset(row, 2u);
			atomicAdd(&g_gHist[((q.x >> 16u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.y >> 16u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.z >> 16u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.w >> 16u) & 0xFFu) + off], 1u);
		}
		if (numPasses >= 4u) {
			let off = histOffset(row, 3u);
			atomicAdd(&g_gHist[((q.x >> 24u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.y >> 24u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.z >> 24u) & 0xFFu) + off], 1u);
			atomicAdd(&g_gHist[((q.w >> 24u) & 0xFFu) + off], 1u);
		}
	}
	let tailIdx = numKeysVecFull;
	if ((numKeys & 3u) != 0u &&
		tailIdx >= partitionStartVec &&
		tailIdx <  partitionStartVec + G_HIST_PART_SIZE_VEC &&
		(tailIdx - partitionStartVec) % G_HIST_DIM == gtid) {
		let q = b_sort[tailIdx];
		let base = tailIdx << 2u;
		if (numPasses >= 1u) {
			let off = histOffset(row, 0u);
			if (base + 0u < numKeys) { atomicAdd(&g_gHist[(q.x & 0xFFu) + off], 1u); }
			if (base + 1u < numKeys) { atomicAdd(&g_gHist[(q.y & 0xFFu) + off], 1u); }
			if (base + 2u < numKeys) { atomicAdd(&g_gHist[(q.z & 0xFFu) + off], 1u); }
		}
		if (numPasses >= 2u) {
			let off = histOffset(row, 1u);
			if (base + 0u < numKeys) { atomicAdd(&g_gHist[((q.x >>  8u) & 0xFFu) + off], 1u); }
			if (base + 1u < numKeys) { atomicAdd(&g_gHist[((q.y >>  8u) & 0xFFu) + off], 1u); }
			if (base + 2u < numKeys) { atomicAdd(&g_gHist[((q.z >>  8u) & 0xFFu) + off], 1u); }
		}
		if (numPasses >= 3u) {
			let off = histOffset(row, 2u);
			if (base + 0u < numKeys) { atomicAdd(&g_gHist[((q.x >> 16u) & 0xFFu) + off], 1u); }
			if (base + 1u < numKeys) { atomicAdd(&g_gHist[((q.y >> 16u) & 0xFFu) + off], 1u); }
			if (base + 2u < numKeys) { atomicAdd(&g_gHist[((q.z >> 16u) & 0xFFu) + off], 1u); }
		}
		if (numPasses >= 4u) {
			let off = histOffset(row, 3u);
			if (base + 0u < numKeys) { atomicAdd(&g_gHist[((q.x >> 24u) & 0xFFu) + off], 1u); }
			if (base + 1u < numKeys) { atomicAdd(&g_gHist[((q.y >> 24u) & 0xFFu) + off], 1u); }
			if (base + 2u < numKeys) { atomicAdd(&g_gHist[((q.z >> 24u) & 0xFFu) + off], 1u); }
		}
	}
	workgroupBarrier();
	for (var i = gtid; i < RADIX; i = i + G_HIST_DIM) {
		for (var p = 0u; p < numPasses; p = p + 1u) {
			let row0 = atomicLoad(&g_gHist[i + histOffset(0u, p)]);
			let row1 = atomicLoad(&g_gHist[i + histOffset(1u, p)]);
			let total = row0 + row1;
			if (total != 0u) {
				atomicAdd(&b_globalHist[i + p * RADIX], total);
			}
		}
	}
}
`;
var onesweep_global_hist_default = onesweepGlobalHistSource;
export {
	onesweep_global_hist_default as default,
	onesweepGlobalHistSource
};
