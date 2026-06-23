/**
 * @import { GraphicsDevice } from '../../../platform/graphics/graphics-device.js'
 */
/**
 * Abstract base class for the compute radix sort backends ({@link ComputeRadixSortMultipass}
 * and {@link ComputeRadixSortOneSweep}). Not intended for direct use; always accessed via the
 * {@link ComputeRadixSort} facade.
 *
 * Backends share the same public `sort` / `sortIndirect` / `prepareIndirect` API so the facade
 * can forward calls without inspecting the concrete implementation.
 *
 * @category Graphics
 * @ignore
 */
export class ComputeRadixSortBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {boolean} [indirect] - Whether the instance is for indirect dispatch only.
     */
    constructor(device: GraphicsDevice, indirect?: boolean);
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * Whether this sorter instance was created for indirect-dispatch use only. When `true`,
     * only indirect-mode shaders are compiled and {@link sort} is unavailable.
     *
     * @type {boolean}
     */
    _indirect: boolean;
    /**
     * Minimum element capacity for internal buffers. Set by the caller as a high-water mark to
     * avoid reallocation churn when the workload shrinks; can be lowered to request shrinkage at
     * the next sort call. Concrete backends size allocations using max(element count for the sort,
     * `capacity`); reallocation is deferred until the next sort when that effective size changes.
     * Updated by implementations after allocation.
     *
     * @type {number}
     */
    capacity: number;
    /**
     * Current element count for the last or in-progress sort.
     *
     * @type {number}
     * @protected
     */
    protected _elementCount: number;
    /**
     * Number of key bits the current passes are built for.
     *
     * @type {number}
     * @protected
     */
    protected _numBits: number;
    /**
     * Whether the current sort uses caller-supplied initial values on pass 0.
     *
     * @type {boolean}
     * @protected
     */
    protected _hasInitialValues: boolean;
    /**
     * When true, the last pass skips writing sorted keys (values only); {@link sortedKeys} may be stale.
     *
     * @type {boolean}
     * @protected
     */
    protected _skipLastPassKeyWrite: boolean;
    /**
     * When true, the caller permits the sort to overwrite `keysBuffer` after pass 0 reads it.
     * `_keys1` is not owned by the sorter in this mode — it is assigned to `keysBuffer` before
     * each pass loop and must not be destroyed on realloc/destroy.
     *
     * @type {boolean}
     * @protected
     */
    protected _destructiveKeys: boolean;
    /**
     * Internal keys buffer 0 (ping-pong).
     *
     * @type {StorageBuffer|null}
     * @protected
     */
    protected _keys0: StorageBuffer | null;
    /**
     * Internal keys buffer 1 (ping-pong). When `_destructiveKeys` is true this is borrowed from
     * the caller's `keysBuffer` and must not be destroyed by the sorter.
     *
     * @type {StorageBuffer|null}
     * @protected
     */
    protected _keys1: StorageBuffer | null;
    /**
     * Internal values/indices buffer 0 (ping-pong).
     *
     * @type {StorageBuffer|null}
     * @protected
     */
    protected _values0: StorageBuffer | null;
    /**
     * Internal values/indices buffer 1 (ping-pong).
     *
     * @type {StorageBuffer|null}
     * @protected
     */
    protected _values1: StorageBuffer | null;
    /**
     * Stable metadata buffer returned by {@link prepareIndirect}. Preallocated as four `u32`
     * entries; concrete backends assign `[slotCount, g0, g1, g2]` after `super(device)`. The caller
     * uploads its contents into a GPU uniform unchanged.
     *
     * @type {Uint32Array}
     * @protected
     */
    protected _indirectInfo: Uint32Array;
    /**
     * Returns the sorted indices (or values, when `initialValues` was passed) buffer of the last
     * completed sort. The result lives in whichever ping-pong values buffer was written last,
     * determined by pass-count parity — no separate output buffer is allocated.
     *
     * @type {StorageBuffer|null}
     */
    get sortedIndices(): StorageBuffer | null;
    /**
     * Returns the sorted keys buffer after the last sort. Keys live in one of the internal
     * ping-pong buffers depending on pass count and {@link radixBits}.
     *
     * @type {StorageBuffer|null}
     */
    get sortedKeys(): StorageBuffer | null;
    /**
     * Radix width in bits for this backend. Callers can align their key bit counts to the radix
     * boundary generically without knowing which backend is active.
     *
     * @type {number}
     * @abstract
     */
    get radixBits(): number;
    /**
     * Executes a direct-dispatch radix sort. See subclass docs for argument semantics.
     *
     * @param {StorageBuffer} keysBuffer - Input keys buffer.
     * @param {number} elementCount - Number of elements to sort.
     * @param {number} [numBits] - Number of bits to sort.
     * @param {StorageBuffer} [initialValues] - Optional initial values buffer for pass 0.
     * @param {boolean} [skipLastPassKeyWrite] - Skip writing keys on the last pass.
     * @param {boolean} [destructiveKeys] - When true, the sort may overwrite `keysBuffer` after
     * the first pass reads it (saves one internal key buffer). The caller must not read
     * `keysBuffer` after the sort returns.
     * @returns {StorageBuffer} Sorted values buffer.
     * @abstract
     */
    sort(keysBuffer: StorageBuffer, elementCount: number, numBits?: number, initialValues?: StorageBuffer, skipLastPassKeyWrite?: boolean, destructiveKeys?: boolean): StorageBuffer;
    /**
     * Executes an indirect-dispatch radix sort using workgroup counts pre-written into
     * `device.indirectDispatchBuffer` (typically by a shader that included the
     * `sortIndirectArgsCS` WGSL chunk). See subclass docs for argument semantics.
     *
     * @param {StorageBuffer} keysBuffer - Input keys buffer.
     * @param {number} maxElementCount - Maximum elements (allocation size).
     * @param {number} numBits - Number of bits to sort.
     * @param {number} sortSlotBase - Base indirect dispatch slot index. The backend uses
     * `slotCount` consecutive slots starting at this index; see {@link prepareIndirect}.
     * @param {StorageBuffer} sortElementCountBuffer - GPU-written element count buffer.
     * @param {StorageBuffer} [initialValues] - Optional initial values buffer for pass 0.
     * @param {boolean} [skipLastPassKeyWrite] - Skip writing keys on the last pass.
     * @param {boolean} [destructiveKeys] - When true, the sort may overwrite `keysBuffer` after
     * the first pass reads it (saves one internal key buffer). The caller must not read
     * `keysBuffer` after the sort returns.
     * @returns {StorageBuffer} Sorted values buffer.
     * @abstract
     */
    sortIndirect(keysBuffer: StorageBuffer, maxElementCount: number, numBits: number, sortSlotBase: number, sortElementCountBuffer: StorageBuffer, initialValues?: StorageBuffer, skipLastPassKeyWrite?: boolean, destructiveKeys?: boolean): StorageBuffer;
    /**
     * Returns stable sort metadata describing how many indirect dispatch slots this backend uses
     * and the elements-per-workgroup granularity of each slot. The returned 4-element Uint32
     * array is sorter-owned and never reallocated across calls, so it can be uploaded directly as
     * a uniform `vec4<u32>` and reused as the `slotInfo` argument to the `writeSortIndirectArgs`
     * WGSL helper (see `sortIndirectArgsCS` chunk):
     *
     * ```
     * [slotCount, g0, g1, g2]   // g_i = elements-per-workgroup for slot i; unused entries = 0
     * ```
     *
     * The caller must reserve `slotCount` consecutive slots in `device.indirectDispatchBuffer`
     * via {@link GraphicsDevice#getIndirectDispatchSlot} and pass the resulting base to
     * {@link sortIndirect}.
     *
     * @returns {Uint32Array} Sorter-owned 4-element Uint32 array (stable across calls).
     */
    prepareIndirect(): Uint32Array;
    /**
     * Allocates ping-pong key/value buffers (`u32` per element). When `_destructiveKeys` is true,
     * `_keys1` is left null — the caller's `keysBuffer` will be borrowed into it before each pass
     * loop instead.
     *
     * @param {number} effectiveCount - Element high-water count (same units as `capacity` sizing).
     * @protected
     */
    protected _allocatePingPongElementBuffers(effectiveCount: number): void;
    /**
     * Destroys ping-pong keys/values buffers owned by the base. When `_destructiveKeys` is true,
     * `_keys1` is borrowed from the caller and is not destroyed.
     *
     * @protected
     */
    protected _destroyPingPongBuffers(): void;
    /**
     * Releases resources owned by this backend.
     */
    destroy(): void;
}
import type { GraphicsDevice } from '../../../platform/graphics/graphics-device.js';
import { StorageBuffer } from '../../../platform/graphics/storage-buffer.js';
