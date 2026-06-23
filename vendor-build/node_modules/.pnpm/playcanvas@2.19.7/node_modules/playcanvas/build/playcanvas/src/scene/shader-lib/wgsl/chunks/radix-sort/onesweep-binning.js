const onesweepBinningSource = `
@group(0) @binding(0) var<storage, read> inputKeys: array<u32>;
@group(0) @binding(1) var<storage, read_write> outputKeys: array<u32>;
@group(0) @binding(2) var<storage, read> inputValues: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputValues: array<u32>;
@group(0) @binding(4) var<storage, read_write> b_passHist: array<atomic<u32>>;
@group(0) @binding(5) var<storage, read_write> b_index: array<atomic<u32>>;
struct OneSweepBinningUniforms {
	numKeys: u32,
	threadBlocks: u32,
	pass_: u32,
	flags: u32
};
@group(0) @binding(6) var<uniform> uniforms: OneSweepBinningUniforms;
#ifdef USE_INDIRECT_SORT
@group(0) @binding(7) var<storage, read> b_sortElementCount: array<u32>;
#endif
const RADIX: u32 = 256u;
const RADIX_MASK: u32 = 255u;
const RADIX_LOG: u32 = 8u;
const D_DIM: u32 = {D_DIM}u;
const KEYS_PER_THREAD: u32 = {KEYS_PER_THREAD}u;
const PART_SIZE: u32 = D_DIM * KEYS_PER_THREAD;
const MAX_SUBGROUPS: u32 = {MAX_SUBGROUPS}u;
const WAVE_HISTS_SIZE: u32 = MAX_SUBGROUPS * RADIX;
const G_D_SIZE: u32 = max(PART_SIZE, WAVE_HISTS_SIZE);
const FLAG_NOT_READY: u32 = 0u;
const FLAG_REDUCTION: u32 = 1u;
const FLAG_INCLUSIVE: u32 = 2u;
const FLAG_MASK: u32 = 3u;
var<workgroup> g_d: array<atomic<u32>, G_D_SIZE>;
var<workgroup> digit_base: array<u32, RADIX>;
var<workgroup> sg_totals: array<u32, MAX_SUBGROUPS>;
var<workgroup> wg_partIndex: u32;
fn passHistOffset(tb: u32, pass_: u32, partitionIdx: u32) -> u32 {
	return pass_ * tb * RADIX + partitionIdx * RADIX;
}
@compute @workgroup_size(D_DIM, 1, 1)
fn main(
	@builtin(local_invocation_index) TID: u32,
	@builtin(subgroup_invocation_id) sgInvId: u32,
	@builtin(subgroup_size) sgSize: u32,
) {
	let waveIndex = TID / sgSize;
	let ltMask = (1u << sgInvId) - 1u;
	let activeMask = select(0xFFFFFFFFu, (1u << sgSize) - 1u, sgSize < 32u);
	let pass_ = uniforms.pass_;
	let currentBit = pass_ << 3u;
	#ifdef USE_INDIRECT_SORT
	let numKeys = b_sortElementCount[0];
	let threadBlocks = (numKeys + PART_SIZE - 1u) / PART_SIZE;
	#else
	let numKeys = uniforms.numKeys;
	let threadBlocks = uniforms.threadBlocks;
	#endif
	let isFirstPass = (uniforms.flags & 1u) != 0u;
	let isLastPass = (uniforms.flags & 2u) != 0u;
	if (TID == 0u) {
		wg_partIndex = atomicAdd(&b_index[pass_], 1u);
	}
	let partitionIndex = workgroupUniformLoad(&wg_partIndex);
	for (var i = TID; i < WAVE_HISTS_SIZE; i = i + D_DIM) {
		atomicStore(&g_d[i], 0u);
	}
	workgroupBarrier();
	let tileStart = partitionIndex * PART_SIZE;
	let validInBlock = select(
		0u,
		min(PART_SIZE, numKeys - tileStart),
		tileStart < numKeys
	);
	let subPartSize = sgSize * KEYS_PER_THREAD;
	let waveBase = tileStart + waveIndex * subPartSize;
	var keys: array<u32, {KEYS_PER_THREAD}>;
	var values: array<u32, {KEYS_PER_THREAD}>;
	var validMask: u32 = 0u;
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		let gid = waveBase + sgInvId + i * sgSize;
		let is_valid = gid < numKeys;
		keys[i] = select(0xFFFFFFFFu, inputKeys[gid], is_valid);
		values[i] = select(
			select(0u, inputValues[gid], is_valid),
			gid,
			isFirstPass
		);
		if (is_valid) {
			validMask = validMask | (1u << i);
		}
	}
	var offsets: array<u32, {KEYS_PER_THREAD}>;
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		let k = keys[i];
		let isValid = ((validMask >> i) & 1u) == 1u;
		let digit = (k >> currentBit) & RADIX_MASK;
		var waveFlag: u32 = activeMask;
		for (var b = 0u; b < 8u; b = b + 1u) {
			let t = ((digit >> b) & 1u) == 1u;
			let ballot = subgroupBallot(t).x;
			waveFlag = waveFlag & select(~ballot, ballot, t);
		}
		let validBallot = subgroupBallot(isValid).x;
		waveFlag = waveFlag & validBallot;
		let peerBits = countOneBits(waveFlag & ltMask);
		let totalBits = countOneBits(waveFlag);
		let lowestRankPeer = firstTrailingBit(waveFlag);
		var preIncrementVal: u32 = 0u;
		if (isValid && peerBits == 0u) {
			preIncrementVal = atomicAdd(&g_d[waveIndex * RADIX + digit], totalBits);
		}
		offsets[i] = subgroupShuffle(preIncrementVal, lowestRankPeer) + peerBits;
		workgroupBarrier();
	}
	var myHistRed: u32 = 0u;
	{
		var histReduction = atomicLoad(&g_d[TID]);
		for (var w = 1u; w < MAX_SUBGROUPS; w = w + 1u) {
			let idx = TID + w * RADIX;
			let cnt = atomicLoad(&g_d[idx]);
			histReduction = histReduction + cnt;
			atomicStore(&g_d[idx], histReduction - cnt);
		}
		myHistRed = histReduction;
	}
	if (partitionIndex + 1u < threadBlocks) {
		let dst = passHistOffset(threadBlocks, pass_, partitionIndex + 1u) + TID;
		atomicAdd(&b_passHist[dst], FLAG_REDUCTION | (myHistRed << 2u));
	}
	let warpExcl = subgroupExclusiveAdd(myHistRed);
	let warpTotal = subgroupAdd(myHistRed);
	if (sgInvId == 0u) {
		sg_totals[waveIndex] = warpTotal;
	}
	workgroupBarrier();
	if (TID == 0u) {
		var acc: u32 = 0u;
		for (var w = 0u; w < MAX_SUBGROUPS; w = w + 1u) {
			let t = sg_totals[w];
			sg_totals[w] = acc;
			acc = acc + t;
		}
	}
	workgroupBarrier();
	let myDigitBase = warpExcl + sg_totals[waveIndex];
	var scatterPos: array<u32, {KEYS_PER_THREAD}>;
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		let k = keys[i];
		let digit = (k >> currentBit) & RADIX_MASK;
		let warpBase = select(0u, atomicLoad(&g_d[waveIndex * RADIX + digit]), waveIndex > 0u);
		scatterPos[i] = offsets[i] + warpBase;
	}
	digit_base[TID] = myDigitBase;
	workgroupBarrier();
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		let k = keys[i];
		let digit = (k >> currentBit) & RADIX_MASK;
		scatterPos[i] = scatterPos[i] + digit_base[digit];
	}
	workgroupBarrier();
	if (TID < RADIX) {
		var lookbackReduction: u32 = 0u;
		var k: u32 = partitionIndex;
		var done: bool = false;
		loop {
			if (done) { break; }
			let flagPayload = atomicLoad(&b_passHist[passHistOffset(threadBlocks, pass_, k) + TID]);
			let flag = flagPayload & FLAG_MASK;
			if (flag == FLAG_INCLUSIVE) {
				lookbackReduction = lookbackReduction + (flagPayload >> 2u);
				if (partitionIndex + 1u < threadBlocks) {
					let dst = passHistOffset(threadBlocks, pass_, partitionIndex + 1u) + TID;
					atomicAdd(&b_passHist[dst], 1u | (lookbackReduction << 2u));
				}
				digit_base[TID] = lookbackReduction - myDigitBase;
				done = true;
			} else if (flag == FLAG_REDUCTION) {
				lookbackReduction = lookbackReduction + (flagPayload >> 2u);
				if (k == 0u) { done = true; }
				else { k = k - 1u; }
			}
		}
	}
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		if (((validMask >> i) & 1u) == 1u) {
			atomicStore(&g_d[scatterPos[i]], keys[i]);
		}
	}
	workgroupBarrier();
	var linearDigits: array<u32, {KEYS_PER_THREAD}>;
	for (var r = 0u; r < KEYS_PER_THREAD; r = r + 1u) {
		let linearIdx = TID + r * D_DIM;
		if (linearIdx < validInBlock) {
			let k = atomicLoad(&g_d[linearIdx]);
			let digit = (k >> currentBit) & RADIX_MASK;
			linearDigits[r] = digit;
			let globalPos = digit_base[digit] + linearIdx;
			if (!isLastPass) {
				outputKeys[globalPos] = k;
			}
		}
	}
	workgroupBarrier();
	for (var i = 0u; i < KEYS_PER_THREAD; i = i + 1u) {
		if (((validMask >> i) & 1u) == 1u) {
			atomicStore(&g_d[scatterPos[i]], values[i]);
		}
	}
	workgroupBarrier();
	for (var r = 0u; r < KEYS_PER_THREAD; r = r + 1u) {
		let linearIdx = TID + r * D_DIM;
		if (linearIdx < validInBlock) {
			let v = atomicLoad(&g_d[linearIdx]);
			let digit = linearDigits[r];
			let globalPos = digit_base[digit] + linearIdx;
			outputValues[globalPos] = v;
		}
	}
}
`;
var onesweep_binning_default = onesweepBinningSource;
export {
	onesweep_binning_default as default,
	onesweepBinningSource
};
