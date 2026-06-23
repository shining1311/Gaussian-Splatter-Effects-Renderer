/**
 * Single-sweep GPU radix sort based on OneSweep (Adinets & Merrill, NVIDIA,
 * 2022). For 32-bit keys it issues only:
 *
 *  - 1× GlobalHistogram dispatch (one read of the keys, builds all 4 digit
 *    histograms simultaneously).
 *  - 1× Scan dispatch (exclusive scan of the 256-entry digit histogram per
 *    pass, publishes block 0's inclusive base to the chained lookback).
 *  - N× DigitBinningPass dispatches (one per radix pass), each of which
 *    fuses rank + block-local digit scan + chained-scan lookback +
 *    coalesced scatter into a single kernel.
 *
 * Compared to the classic histogram + scan + reorder pipeline, this halves
 * the number of full passes over the key buffer on the critical path, and
 * eliminates all but one round-trip to device memory for scan results.
 *
 * WGSL ported from [b0nes164/GPUSorting](https://github.com/b0nes164/GPUSorting)
 * (Thomas Smith, MIT License). See {@link ComputeRadixSortMultipass} for the classic
 * multi-pass fallback used on devices where OneSweep's spin-based lookback cannot make
 * forward progress (e.g. Apple Silicon lacking forward-thread progress guarantees).
 *
 * **Requirements:**
 *  - `device.supportsCompute` (WebGPU)
 *  - `device.supportsSubgroups` and a runtime subgroup size <= 32
 *  - The device's lookback must be able to make progress under producer/
 *    consumer partition scheduling (true on NVIDIA Turing+, AMD GCN+, Intel
 *    Gen9+). Apple Silicon and any other device lacking forward-thread-
 *    progress guarantees should use {@link ComputeRadixSortMultipass}
 *    instead.
 *
 * Not exported as a public class; always accessed through the
 * {@link ComputeRadixSort} facade with `kind: RADIX_SORT_ONESWEEP` or
 * `RADIX_SORT_AUTO` on supported hardware.
 *
 * @category Graphics
 * @ignore
 */
export class ComputeRadixSortOneSweep extends ComputeRadixSortBase {
    /**
     * Number of DigitBinningPass workgroups actually dispatched for the
     * current sort. Derived from `elementCount` (not `capacity`) so that
     * smaller sorts issue fewer workgroups even when buffers are sized for
     * a larger high-water mark.
     *
     * @type {number}
     */
    _threadBlocks: number;
    /**
     * Allocated thread-block capacity (buffer sizing). Buffers are only
     * reallocated when this value changes. Always `>= _threadBlocks`.
     *
     * @type {number}
     */
    _allocatedThreadBlocks: number;
    /**
     * Per-pass 256-entry digit histograms, concatenated across MAX_PASSES
     * passes. Written by GlobalHistogram, consumed by Scan.
     *
     * @type {StorageBuffer|null}
     */
    _globalHist: StorageBuffer | null;
    /**
     * Chained-scan lookback buffer: `MAX_PASSES × threadBlocks × RADIX` u32.
     * Block 0's slot of each pass is initialised by Scan with FLAG_INCLUSIVE
     * and the global exclusive prefix. Other blocks' slots are populated by
     * DigitBinningPass.
     *
     * @type {StorageBuffer|null}
     */
    _passHist: StorageBuffer | null;
    /**
     * Atomic counters for partition-tile assignment, one per pass.
     *
     * @type {StorageBuffer|null}
     */
    _index: StorageBuffer | null;
    /** @type {Vec2} */
    _binningDispatchSize: Vec2;
    /** @type {Vec2} */
    _globalHistDispatchSize: Vec2;
    /** @type {BindGroupFormat|null} */
    _globalHistBindGroupFormat: BindGroupFormat | null;
    /** @type {BindGroupFormat|null} */
    _scanBindGroupFormat: BindGroupFormat | null;
    /** @type {BindGroupFormat|null} */
    _binningBindGroupFormat: BindGroupFormat | null;
    /** @type {UniformBufferFormat|null} */
    _globalHistUniformFormat: UniformBufferFormat | null;
    /** @type {UniformBufferFormat|null} */
    _scanUniformFormat: UniformBufferFormat | null;
    /** @type {UniformBufferFormat|null} */
    _binningUniformFormat: UniformBufferFormat | null;
    /** @type {Shader|null} */
    _globalHistShader: Shader | null;
    /** @type {Shader|null} */
    _scanShader: Shader | null;
    /** @type {Shader|null} */
    _binningShader: Shader | null;
    /** @type {Compute|null} */
    _globalHistCompute: Compute | null;
    /** @type {Compute|null} */
    _scanCompute: Compute | null;
    /** @type {Compute[]} */
    _binningComputes: Compute[];
    /** @private */
    private _destroyBuffers;
    /**
     * Ensures there are enough Compute objects for the requested pass count.
     * Each pass uses its own Compute (bindings differ because of ping-pong).
     *
     * @param {number} numPasses - Number of radix passes.
     * @private
     */
    private _ensureBinningComputes;
    /**
     * Allocates or resizes internal buffers.
     *
     * @param {number} elementCount - Number of elements to sort.
     * @param {boolean} [forceRealloc] - Force buffer reallocation even if sizes match.
     * @private
     */
    private _allocateBuffers;
}
import { ComputeRadixSortBase } from './compute-radix-sort-base.js';
import { StorageBuffer } from '../../../platform/graphics/storage-buffer.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { BindGroupFormat } from '../../../platform/graphics/bind-group-format.js';
import { UniformBufferFormat } from '../../../platform/graphics/uniform-buffer-format.js';
import { Shader } from '../../../platform/graphics/shader.js';
import { Compute } from '../../../platform/graphics/compute.js';
