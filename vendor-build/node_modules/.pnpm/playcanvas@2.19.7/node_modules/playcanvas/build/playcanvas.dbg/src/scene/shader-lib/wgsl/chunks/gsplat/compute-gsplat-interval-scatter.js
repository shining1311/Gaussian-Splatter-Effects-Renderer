const computeGsplatIntervalScatterSource = (
  /* wgsl */
  `

struct Interval {
    workBufferBase: u32,
    splatCount: u32,
    boundsIndex: u32,
    pad: u32
};

struct ScatterUniforms {
    numIntervals: u32,
    pad0: u32,
    pad1: u32,
    pad2: u32
};
@group(0) @binding(0) var<uniform> uniforms: ScatterUniforms;

@group(0) @binding(1) var<storage, read> intervals: array<Interval>;

@group(0) @binding(2) var<storage, read> prefixSumBuffer: array<u32>;

@group(0) @binding(3) var<storage, read_write> compactedOutput: array<u32>;

@compute @workgroup_size({WORKGROUP_SIZE})
fn main(
    @builtin(workgroup_id) wgId: vec3u,
    @builtin(num_workgroups) numWorkgroups: vec3u,
    @builtin(local_invocation_id) lid: vec3u
) {
    // reconstruct the linear interval index from the (possibly Y-tiled) 2D dispatch
    let intervalIdx = wgId.y * numWorkgroups.x + wgId.x;
    if (intervalIdx >= uniforms.numIntervals) { return; }

    let outputOffset = prefixSumBuffer[intervalIdx];
    let nextOffset = prefixSumBuffer[intervalIdx + 1u];
    let count = nextOffset - outputOffset;
    if (count == 0u) { return; }

    let workBufferBase = intervals[intervalIdx].workBufferBase;
    let tid = lid.x;

    for (var j = tid; j < count; j += {WORKGROUP_SIZE}u) {
        compactedOutput[outputOffset + j] = workBufferBase + j;
    }
}
`
);
var compute_gsplat_interval_scatter_default = computeGsplatIntervalScatterSource;
export {
  computeGsplatIntervalScatterSource,
  compute_gsplat_interval_scatter_default as default
};
