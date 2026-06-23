import indirectCoreCS from "../common/comp/indirect-core.js";
import dispatchCoreCS from "../common/comp/dispatch-core.js";
import sortIndirectArgsCS from "../common/comp/sort-indirect-args.js";
const computeGsplatWriteIndirectArgsSource = `
${indirectCoreCS}
${dispatchCoreCS}
${sortIndirectArgsCS}
@group(0) @binding(0) var<storage, read> prefixSumBuffer: array<u32>;
@group(0) @binding(1) var<storage, read_write> indirectDrawArgs: array<DrawIndexedIndirectArgs>;
@group(0) @binding(2) var<storage, read_write> numSplatsBuf: array<u32>;
@group(0) @binding(3) var<storage, read_write> indirectDispatchArgs: array<u32>;
@group(0) @binding(4) var<storage, read_write> sortElementCountBuf: array<u32>;
struct WriteArgsUniforms {
	drawSlot: u32,
	indexCount: u32,
	dispatchSlotBase: u32,
	totalSplats: u32,
	sortIndirectInfo: vec4<u32>
};
@group(0) @binding(5) var<uniform> uniforms: WriteArgsUniforms;
@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) gid: vec3u) {
	let count = prefixSumBuffer[uniforms.totalSplats];
	let instanceCount = (count + {INSTANCE_SIZE}u - 1u) / {INSTANCE_SIZE}u;
	indirectDrawArgs[uniforms.drawSlot] = DrawIndexedIndirectArgs(
		uniforms.indexCount,
		instanceCount,
		0u,
		0,
		0u
	);
	numSplatsBuf[0] = count;
	let keygenSlot = uniforms.dispatchSlotBase;
	let keygenOffset = keygenSlot * 3u;
	let keygenWorkgroupCount = (count + {KEYGEN_THREADS_PER_WORKGROUP}u - 1u) / {KEYGEN_THREADS_PER_WORKGROUP}u;
	let keygenDim = calcDispatch2D(keygenWorkgroupCount, {MAX_WORKGROUPS_PER_DIM}u);
	indirectDispatchArgs[keygenOffset + 0u] = keygenDim.x;
	indirectDispatchArgs[keygenOffset + 1u] = keygenDim.y;
	indirectDispatchArgs[keygenOffset + 2u] = 1u;
	writeSortIndirectArgs(keygenSlot + 1u, count, uniforms.sortIndirectInfo);
	sortElementCountBuf[0] = count;
}
`;
var compute_gsplat_write_indirect_args_default = computeGsplatWriteIndirectArgsSource;
export {
	computeGsplatWriteIndirectArgsSource,
	compute_gsplat_write_indirect_args_default as default
};
