export class GSplatWorldState {
    /**
     * @param {import('../../platform/graphics/graphics-device.js').GraphicsDevice} device - The graphics device.
     * @param {number} version - The version number.
     * @param {GSplatInfo[]} splats - The splats for this world state.
     * @param {BlockAllocator} allocator - Persistent block allocator (owned by GSplatManager).
     * @param {Map<number, MemBlock>} allocationMap - Persistent allocId-to-MemBlock map (owned by GSplatManager).
     */
    constructor(device: import("../../platform/graphics/graphics-device.js").GraphicsDevice, version: number, splats: GSplatInfo[], allocator: BlockAllocator, allocationMap: Map<number, MemBlock>);
    /**
     * The version of the world state.
     */
    version: number;
    /**
     * Whether the sort parameters have been set on the sorter.
     */
    sortParametersSet: boolean;
    /**
     * Whether the world state has been sorted before.
     */
    sortedBefore: boolean;
    /**
     * An array of all splats managed by this world state.
     *
     * @type {GSplatInfo[]}
     */
    splats: GSplatInfo[];
    /**
     * The texture size of work buffer.
     */
    textureSize: number;
    /**
     * Total number of active splats across all placements.
     */
    totalActiveSplats: number;
    /**
     * Total number of intervals across all placements. Each placement contributes
     * either its interval count (intervals.length / 2) or 1 if it has no intervals.
     */
    totalIntervals: number;
    /**
     * Deduplicated list of splat groups sharing the same parent placement. Multiple child
     * placements (e.g. octree file nodes) that reference the same parent share a single
     * set of bounding spheres and a single world transform, so they are grouped together.
     * Each entry contains a representative splat, the starting index into the bounds/transforms
     * textures (boundsBaseIndex), and the number of bounding sphere entries for the group.
     *
     * @type {Array<{splat: GSplatInfo, boundsBaseIndex: number, numBoundsEntries: number}>}
     */
    boundsGroups: Array<{
        splat: GSplatInfo;
        boundsBaseIndex: number;
        numBoundsEntries: number;
    }>;
    /**
     * Files to decrement when this state becomes active.
     * Array of tuples: [octree, fileIndex]
     *
     * @type {Array<[GSplatOctree, number]>}
     */
    pendingReleases: Array<[GSplatOctree, number]>;
    /**
     * Splats that need to be rendered to the work buffer. Contains newly allocated or
     * re-allocated splats, or all splats when fullRebuild is true.
     *
     * @type {GSplatInfo[]}
     */
    needsUpload: GSplatInfo[];
    /**
     * AllocIds of splats in needsUpload, for fast membership checks during merge.
     *
     * @type {Set<number>}
     */
    needsUploadIds: Set<number>;
    /**
     * Reverse map from allocId to the GSplatInfo that owns it, for efficient merge lookups
     * in cleanupOldWorldStates without scanning all splats.
     *
     * @type {Map<number, GSplatInfo>}
     */
    allocIdToSplat: Map<number, GSplatInfo>;
    /**
     * True when the allocator grew or defragmented, meaning all block offsets may have
     * changed and every splat must be re-rendered to the work buffer.
     */
    fullRebuild: boolean;
    destroy(): void;
    /**
     * Populates module-scope scratch arrays with allocations to free/create by diffing the
     * current splat set against the existing allocation map.
     *
     * @param {GSplatInfo[]} splats - Active splats for this state.
     * @param {Map<number, MemBlock>} allocationMap - Persistent allocId-to-MemBlock map.
     * @private
     */
    private computeAllocationDiff;
    /**
     * Process a single allocId/size pair: mark as seen, check for size changes, and
     * queue allocations or frees as needed.
     *
     * @param {number} allocId - The allocation identifier.
     * @param {number} size - Required size for this allocation.
     * @param {Map<number, MemBlock>} allocationMap - Persistent allocId-to-MemBlock map.
     * @private
     */
    private _diffAlloc;
    /**
     * Executes pending allocation changes via the BlockAllocator, runs incremental defrag,
     * derives the texture size, and releases scratch arrays.
     *
     * @param {import('../../platform/graphics/graphics-device.js').GraphicsDevice} device - The graphics device.
     * @param {BlockAllocator} allocator - The block allocator.
     * @param {Map<number, MemBlock>} allocationMap - Persistent allocId-to-MemBlock map.
     * @returns {{ fullRebuild: boolean, changedAllocIds: Set<number>|null }} Whether a full
     * rebuild was triggered and the set of changed allocation ids.
     * @private
     */
    private applyAllocations;
    /**
     * Assigns work-buffer offsets to each splat from allocated blocks and builds the
     * needsUpload list for splats that require re-rendering.
     *
     * @param {GSplatInfo[]} splats - Active splats for this state.
     * @param {Map<number, MemBlock>} allocationMap - Persistent allocId-to-MemBlock map.
     * @param {boolean} fullRebuild - Whether all splats must be re-rendered.
     * @param {Set<number>|null} changedAllocIds - Allocation ids that were newly allocated or moved.
     * @private
     */
    private assignSplatOffsets;
    /**
     * Builds boundsGroups by grouping splats that share a parentPlacementId, assigns
     * sequential boundsBaseIndex to each group, and propagates it back to splats.
     *
     * @param {GSplatInfo[]} splats - Active splats for this state.
     * @private
     */
    private buildBoundsGroups;
}
import type { GSplatInfo } from './gsplat-info.js';
import type { GSplatOctree } from './gsplat-octree.js';
import type { BlockAllocator } from '../../core/block-allocator.js';
import type { MemBlock } from '../../core/block-allocator.js';
