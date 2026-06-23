/**
 * Portable multi-pass 4-bit radix sort implementation (16 buckets per pass). Provides
 * stable sorting of 32-bit unsigned integer keys and returns sorted indices or
 * caller-supplied values. WebGPU only.
 *
 * **Performance characteristics:**
 * - 4 passes for 16-bit keys, 8 passes for 32-bit keys
 * - Each pass processes 4 bits (16 buckets)
 * - Workgroup size: 16x16 = 256 threads, 8 elements per thread = 2048 elements/workgroup
 * - Works on every WebGPU device (no subgroup intrinsics required)
 *
 * **Algorithm (per pass):**
 * 1. **Histogram**: Each thread extracts 4-bit digits from its elements and
 *    contributes to a per-workgroup histogram using shared memory atomics.
 * 2. **Prefix Sum**: Hierarchical Blelloch scan on block histograms to compute
 *    global offsets for each (digit, workgroup) pair.
 * 3. **Ranked Scatter**: Re-reads keys in rounds, computes local ranks using
 *    per-digit 256-bit bitmasks and hardware popcount, then scatters using:
 *    `position = global_prefix[digit][workgroup] + cumulative_local_rank`
 *
 * Based on "Fast 4-way parallel radix sorting on GPUs" algorithm, implemented
 * following [WebGPU-Radix-Sort](https://github.com/kishimisu/WebGPU-Radix-Sort)
 * by kishimisu (MIT License).
 *
 * Selected as the portable fallback across all non-subgroup and non-NVIDIA
 * devices after benchmarking wider radixes (6-bit, 8-bit shared, 8-bit
 * subgroup variants, OneSweep) on Apple M1/M2/M4, NVIDIA, and Android Mali/
 * IMG — 4-bit is the single most consistent winner or close-second in every
 * target range.
 *
 * Not exported as a public class; always accessed through the
 * {@link ComputeRadixSort} facade with `kind: RADIX_SORT_PORTABLE` or
 * `RADIX_SORT_AUTO`.
 *
 * @category Graphics
 * @ignore
 */
export class ComputeRadixSortMultipass extends ComputeRadixSortBase {
    /**
     * Number of workgroups actually dispatched for the current sort.
     * Derived from `elementCount` (not `capacity`) so that smaller sorts issue
     * fewer workgroups even when buffers are sized for a larger high-water
     * mark.
     */
    _workgroupCount: number;
    /**
     * Allocated workgroup capacity (buffer sizing). Buffers are only
     * reallocated when this value changes. Always `>= _workgroupCount`.
     */
    _allocatedWorkgroupCount: number;
    /**
     * Block sums buffer (BUCKET_COUNT entries per workgroup).
     *
     * @type {StorageBuffer|null}
     */
    _blockSums: StorageBuffer | null;
    /**
     * Prefix sum kernel for block sums (hierarchical Blelloch scan).
     *
     * @type {PrefixSumKernel|null}
     */
    _prefixSumKernel: PrefixSumKernel | null;
    /**
     * Dispatch dimensions.
     */
    _dispatchSize: Vec2;
    /**
     * Cached bind group format for histogram shader.
     *
     * @type {BindGroupFormat|null}
     */
    _histogramBindGroupFormat: BindGroupFormat | null;
    /**
     * Cached bind group format for reorder shader.
     *
     * @type {BindGroupFormat|null}
     */
    _reorderBindGroupFormat: BindGroupFormat | null;
    /**
     * Uniform buffer format for runtime uniforms.
     *
     * @type {UniformBufferFormat|null}
     */
    _uniformBufferFormat: UniformBufferFormat | null;
    /**
     * Cached compute passes. Each entry contains {histogramCompute, reorderCompute} for one pass.
     *
     * @type {Array<{histogramCompute: Compute, reorderCompute: Compute}>}
     */
    _passes: Array<{
        histogramCompute: Compute;
        reorderCompute: Compute;
    }>;
    /**
     * Destroys all cached passes and their shaders.
     *
     * @private
     */
    private _destroyPasses;
    /**
     * Destroys internal buffers (not passes or bind group formats).
     *
     * @private
     */
    private _destroyBuffers;
    /**
     * Creates cached compute passes for all bit offsets.
     *
     * @param {number} numBits - Number of bits to sort.
     * @param {boolean} hasInitialValues - Whether pass 0 reads from caller-supplied initial values.
     * @param {boolean} skipLastPassKeyWrite - Whether the last pass skips writing keys.
     * @private
     */
    private _createPasses;
    /**
     * Allocates or resizes internal buffers and creates passes if needed.
     *
     * @param {number} elementCount - Number of elements to sort.
     * @param {number} numBits - Number of bits to sort.
     * @param {boolean} hasInitialValues - Whether pass 0 reads caller-supplied initial values.
     * @param {boolean} skipLastPassKeyWrite - Whether the last pass skips writing keys.
     * @param {boolean} [forceRealloc] - Force buffer reallocation even if sizes match.
     * @private
     */
    private _allocateBuffers;
    /**
     * Creates a shader with constants embedded.
     *
     * @param {string} name - Shader name.
     * @param {string} source - Shader source.
     * @param {number} currentBit - Current bit offset for this pass.
     * @param {boolean} isFirstPass - Whether this is the first pass (uses GID for indices).
     * @param {boolean} isLastPass - Whether this is the last pass and can skip writing keys.
     * @param {BindGroupFormat} bindGroupFormat - Bind group format.
     * @returns {Shader} The created shader.
     * @private
     */
    private _createShader;
    /**
     * Shared execution logic for both direct and indirect radix sort.
     *
     * @param {StorageBuffer} keysBuffer - Input keys buffer.
     * @param {number} elementCount - Number of elements (or max elements for indirect).
     * @param {number} numBits - Number of bits to sort.
     * @param {number} sortSlotBase - Indirect dispatch slot index (-1 for direct).
     * @param {StorageBuffer|null} sortElementCountBuffer - GPU-written element count (null for direct).
     * @param {StorageBuffer} [initialValues] - Optional initial values buffer for pass 0.
     * @param {boolean} [skipLastPassKeyWrite] - When true, the last pass skips writing sorted
     * keys for a small performance gain. Only use when sorted keys are not needed after sorting.
     * @param {boolean} [destructiveKeys] - When true, borrow `keysBuffer` as the second ping-pong
     * key buffer (saves one N×4 allocation). The sort may overwrite `keysBuffer` after pass 0.
     * @returns {StorageBuffer} Storage buffer containing sorted values.
     * @private
     */
    private _execute;
}
import { ComputeRadixSortBase } from './compute-radix-sort-base.js';
import { StorageBuffer } from '../../../platform/graphics/storage-buffer.js';
import { PrefixSumKernel } from '../prefix-sum-kernel.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { BindGroupFormat } from '../../../platform/graphics/bind-group-format.js';
import { UniformBufferFormat } from '../../../platform/graphics/uniform-buffer-format.js';
import { Compute } from '../../../platform/graphics/compute.js';
