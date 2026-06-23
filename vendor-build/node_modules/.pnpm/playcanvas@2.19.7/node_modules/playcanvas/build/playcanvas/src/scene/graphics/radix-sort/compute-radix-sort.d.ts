/**
 * @import { GraphicsDevice } from '../../../platform/graphics/graphics-device.js'
 * @import { StorageBuffer } from '../../../platform/graphics/storage-buffer.js'
 * @import { ComputeRadixSortBase } from './compute-radix-sort-base.js'
 */
/**
 * WebGPU compute radix sort for 32-bit unsigned integer keys. The backend
 * is picked automatically from the device's capabilities, or selected
 * explicitly via the `kind` option (see {@link RADIX_SORT_AUTO},
 * {@link RADIX_SORT_PORTABLE}, {@link RADIX_SORT_ONESWEEP}).
 *
 * Available backends:
 *  - **Portable** ({@link RADIX_SORT_PORTABLE}): Runs on every WebGPU device
 *    (no subgroup intrinsics required). Default fallback.
 *  - **OneSweep** ({@link RADIX_SORT_ONESWEEP}): Single-sweep 8-bit radix
 *    sort. Currently supported for NVIDIA only.
 *
 * Indirect dispatch:
 *  Use {@link prepareIndirect} to obtain the dispatch-slot metadata
 *  (a stable `vec4<u32>` describing slot count and granularity), reserve
 *  the reported number of slots via
 *  {@link GraphicsDevice#getIndirectDispatchSlot}, and write dispatch args
 *  from a compute shader using the `writeSortIndirectArgs` helper (WGSL
 *  chunk `sortIndirectArgsCS`). Then call {@link sortIndirect} with the
 *  slot base and a GPU-written element-count buffer.
 *
 * @example
 * import { ComputeRadixSort, StorageBuffer, BUFFERUSAGE_COPY_SRC, BUFFERUSAGE_COPY_DST } from 'playcanvas';
 *
 * const radixSort = new ComputeRadixSort(device);
 * const keys = new Uint32Array([5, 2, 8, 1, 9, 3]);
 * const keysBuffer = new StorageBuffer(device, keys.byteLength, BUFFERUSAGE_COPY_SRC | BUFFERUSAGE_COPY_DST);
 * keysBuffer.write(keys);
 *
 * // Sort and get the sorted-indices buffer (keys [5,2,8,1,9,3] → index order [3,1,5,0,2,4] for a 16-bit sort)
 * const sortedIndices = radixSort.sort(keysBuffer, keys.length, 16);
 *
 * // Use sortedIndices in subsequent GPU operations, then clean up:
 * radixSort.destroy();
 *
 * @category Graphics
 * @ignore
 */
export class ComputeRadixSort {
    /**
     * @param {GraphicsDevice} device - The graphics device (must support compute).
     * @param {object} [options] - Options.
     * @param {number} [options.kind] - Which radix sort backend to use. One of
     * {@link RADIX_SORT_AUTO} (default), {@link RADIX_SORT_PORTABLE} or
     * {@link RADIX_SORT_ONESWEEP}.
     * @param {boolean} [options.indirect] - When `true`, the instance is configured for
     * indirect-dispatch use only. Only indirect-mode shaders are compiled (avoiding the cost of
     * compiling unused direct-mode pipelines); {@link sort} is unavailable and will assert.
     * Defaults to `false`.
     */
    constructor(device: GraphicsDevice, options?: {
        kind?: number;
        indirect?: boolean;
    });
    /**
     * The active backend implementation.
     *
     * @type {ComputeRadixSortBase}
     * @private
     */
    private _impl;
    /**
     * Returns true when the current device is a good fit for the OneSweep
     * backend. OneSweep relies on forward-thread-progress guarantees for its
     * chained-scan lookback (producer/consumer across workgroups) and on
     * 32-lane subgroup masks in the binning shader.
     *
     * @param {GraphicsDevice} device - Graphics device to inspect.
     * @returns {boolean} True if OneSweep should be preferred.
     * @private
     */
    private _canUseOneSweep;
    /**
     * Returns the sorted indices (or values, when `initialValues` was passed
     * to the last {@link sort} / {@link sortIndirect} call) buffer of the
     * last completed sort.
     *
     * @type {StorageBuffer|null}
     */
    get sortedIndices(): StorageBuffer | null;
    /**
     * Returns the sorted keys buffer of the last completed sort, or `null`
     * if the last pass skipped writing keys (`skipLastPassKeyWrite=true`).
     *
     * @type {StorageBuffer|null}
     */
    get sortedKeys(): StorageBuffer | null;
    /**
     * Radix width in bits of the active backend. Callers can align key bit
     * counts to this boundary generically without knowing which backend is
     * in use.
     *
     * @type {number}
     */
    get radixBits(): number;
    /**
     * High-water mark for internal buffer allocation. Setting this raises
     * the floor for the next sort's allocation; lowering it requests
     * shrinkage at the next sort call.
     *
     * @type {number}
     */
    set capacity(value: number);
    get capacity(): number;
    /**
     * Executes a direct-dispatch radix sort of `elementCount` u32 keys.
     *
     * @param {StorageBuffer} keysBuffer - Input u32 keys buffer (read-only).
     * @param {number} elementCount - Number of elements to sort.
     * @param {number} [numBits] - Number of bits to sort. Must be a multiple
     * of {@link radixBits}. Defaults to 16.
     * @param {StorageBuffer} [initialValues] - Optional caller-supplied
     * initial values for pass 0. When omitted, pass 0 synthesises sequential
     * indices and the sort returns sorted indices.
     * @param {boolean} [skipLastPassKeyWrite] - Skip writing sorted keys on
     * the last pass (marginal perf win; only use when sorted keys aren't
     * needed afterwards).
     * @param {boolean} [destructiveKeys] - When true, the sort may overwrite
     * `keysBuffer` after the first pass reads it, saving one internal N×4
     * key buffer. The caller must not read `keysBuffer` after the sort
     * returns.
     * @returns {StorageBuffer} Sorted values buffer (same as
     * {@link sortedIndices}).
     */
    sort(keysBuffer: StorageBuffer, elementCount: number, numBits?: number, initialValues?: StorageBuffer, skipLastPassKeyWrite?: boolean, destructiveKeys?: boolean): StorageBuffer;
    /**
     * Executes an indirect-dispatch radix sort using workgroup counts
     * pre-written into `device.indirectDispatchBuffer` (typically by a
     * compute shader that included the `sortIndirectArgsCS` WGSL chunk and
     * called `writeSortIndirectArgs`). See {@link prepareIndirect} for the
     * slot metadata and the required slot count.
     *
     * @param {StorageBuffer} keysBuffer - Input u32 keys buffer (read-only).
     * @param {number} maxElementCount - Maximum element count; sizes internal
     * buffers. The GPU-written count in `sortElementCountBuffer[0]` must be
     * `<= maxElementCount`.
     * @param {number} numBits - Number of bits to sort.
     * @param {number} sortSlotBase - Base indirect dispatch slot index. The
     * backend uses `slotCount` consecutive slots starting here (see
     * {@link prepareIndirect}).
     * @param {StorageBuffer} sortElementCountBuffer - GPU-written storage
     * buffer; element `[0]` holds the actual number of keys to sort.
     * @param {StorageBuffer} [initialValues] - Optional initial values for
     * pass 0.
     * @param {boolean} [skipLastPassKeyWrite] - Skip writing keys on the
     * last pass.
     * @param {boolean} [destructiveKeys] - When true, the sort may overwrite
     * `keysBuffer` after the first pass reads it, saving one internal N×4
     * key buffer. The caller must not read `keysBuffer` after the sort
     * returns.
     * @returns {StorageBuffer} Sorted values buffer.
     */
    sortIndirect(keysBuffer: StorageBuffer, maxElementCount: number, numBits: number, sortSlotBase: number, sortElementCountBuffer: StorageBuffer, initialValues?: StorageBuffer, skipLastPassKeyWrite?: boolean, destructiveKeys?: boolean): StorageBuffer;
    /**
     * Returns stable metadata describing how many indirect dispatch slots
     * this backend needs and the elements-per-workgroup granularity of each
     * slot. Forwarded unchanged from the active backend.
     *
     * The returned 4-element `Uint32Array` is sorter-owned and never
     * reallocated; upload it directly as a uniform `vec4<u32>` and pass it
     * as the `slotInfo` argument to the `writeSortIndirectArgs` WGSL helper:
     *
     * ```
     * [slotCount, g0, g1, g2]   // g_i = elements-per-workgroup for slot i;
     *                           // unused entries = 0
     * ```
     *
     * The caller must then reserve `slotCount` consecutive slots in
     * `device.indirectDispatchBuffer` via
     * {@link GraphicsDevice#getIndirectDispatchSlot} and pass the resulting
     * base index to {@link sortIndirect}.
     *
     * @returns {Uint32Array} Sorter-owned 4-element Uint32 array.
     */
    prepareIndirect(): Uint32Array;
    /**
     * Releases all GPU resources owned by this sorter.
     */
    destroy(): void;
}
import type { StorageBuffer } from '../../../platform/graphics/storage-buffer.js';
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
