/**
 * A general-purpose 1D block allocator backed by a doubly-linked list with segregated free-list
 * buckets. Manages a linear address space where contiguous blocks can be allocated and freed.
 * Supports incremental defragmentation and automatic growth.
 *
 * Free blocks are organized into power-of-2 size buckets for best-fit allocation, which reduces
 * fragmentation compared to a single first-fit free list.
 *
 * @ignore
 */
export class BlockAllocator {
    /**
     * Create a new BlockAllocator.
     *
     * @param {number} [capacity] - Initial address space capacity. Defaults to 0.
     * @param {number} [growMultiplier] - Multiplicative growth factor for auto-grow in
     * {@link updateAllocation}. Defaults to 1.1 (10% extra).
     */
    constructor(capacity?: number, growMultiplier?: number);
    /**
     * Head of the main list (all blocks, offset-ordered).
     *
     * @type {MemBlock|null}
     * @private
     */
    private _headAll;
    /**
     * Tail of the main list.
     *
     * @type {MemBlock|null}
     * @private
     */
    private _tailAll;
    /**
     * Segregated free-list bucket heads. Each entry is the head of a doubly-linked list of free
     * blocks whose size falls in that power-of-2 range. Bucket i covers sizes [2^i, 2^(i+1)).
     * The array grows dynamically as larger free blocks appear.
     *
     * @type {Array<MemBlock|null>}
     * @private
     */
    private _freeBucketHeads;
    /**
     * Pool of recycled MemBlock objects.
     *
     * @type {MemBlock[]}
     * @private
     */
    private _pool;
    /**
     * Total address space.
     *
     * @private
     */
    private _capacity;
    /**
     * Sum of all allocated block sizes.
     *
     * @private
     */
    private _usedSize;
    /**
     * Sum of all free region sizes.
     *
     * @private
     */
    private _freeSize;
    /**
     * Number of free regions. Maintained O(1) for the fragmentation metric.
     *
     * @private
     */
    private _freeRegionCount;
    /**
     * Multiplicative growth factor used by {@link updateAllocation}. When growing, the new
     * capacity is at least `capacity * growMultiplier`.
     *
     * @type {number}
     * @private
     */
    private _growMultiplier;
    /**
     * Total address space capacity.
     *
     * @type {number}
     */
    get capacity(): number;
    /**
     * Total size of all allocated blocks.
     *
     * @type {number}
     */
    get usedSize(): number;
    /**
     * Total size of all free regions.
     *
     * @type {number}
     */
    get freeSize(): number;
    /**
     * Fragmentation ratio in the range [0, 1]. Returns 0 when all free space is one contiguous
     * block (ideal), and approaches 1 when free space is split into many pieces. Computed O(1)
     * from the internally maintained free region count.
     *
     * @type {number}
     */
    get fragmentation(): number;
    /**
     * Compute the bucket index for a given block size. Uses floor(log2(size)) via the CLZ
     * intrinsic for integer math.
     *
     * @param {number} size - Block size (must be > 0).
     * @returns {number} Bucket index.
     * @private
     */
    private _bucketFor;
    /**
     * Add a free block to the appropriate size bucket. Prepends to the bucket list for O(1)
     * insertion. Grows the bucket array if needed.
     *
     * @param {MemBlock} block - The free block to add.
     * @private
     */
    private _addToBucket;
    /**
     * Remove a free block from its current size bucket.
     *
     * @param {MemBlock} block - The free block to remove.
     * @private
     */
    private _removeFromBucket;
    /**
     * Move a free block to the correct bucket after its size changed (e.g. due to merging or
     * splitting). Only performs the remove+add if the bucket actually changed.
     *
     * @param {MemBlock} block - The free block whose size has changed.
     * @private
     */
    private _rebucket;
    /**
     * Obtain a MemBlock from the pool or create a new one.
     *
     * @param {number} offset - The offset.
     * @param {number} size - The size.
     * @param {boolean} free - Whether the block is free.
     * @returns {MemBlock} The block.
     * @private
     */
    private _obtain;
    /**
     * Return a MemBlock to the pool.
     *
     * @param {MemBlock} block - The block to release.
     * @private
     */
    private _release;
    /**
     * Insert a block into the main list after a given node.
     *
     * @param {MemBlock} block - The block to insert.
     * @param {MemBlock|null} after - Insert after this node (null = insert at head).
     * @private
     */
    private _insertAfterInMainList;
    /**
     * Remove a block from the main list.
     *
     * @param {MemBlock} block - The block to remove.
     * @private
     */
    private _removeFromMainList;
    /**
     * Find the best-fit free block for the requested size using segregated buckets. Scans the
     * target bucket for the smallest block >= size (best-fit), then falls through to higher
     * buckets where any block is guaranteed large enough (first-fit).
     *
     * @param {number} size - Minimum size needed.
     * @returns {MemBlock|null} The best fitting free block, or null.
     * @private
     */
    private _findFreeBlock;
    /**
     * Allocate a contiguous block of the given size.
     *
     * @param {number} size - The number of units to allocate. Must be > 0.
     * @returns {MemBlock|null} A MemBlock handle, or null if no space is available.
     */
    allocate(size: number): MemBlock | null;
    /**
     * Free a previously allocated block. Adjacent free regions are merged automatically.
     *
     * @param {MemBlock} block - The block to free (must have been returned by {@link allocate}).
     */
    free(block: MemBlock): void;
    /**
     * Grow the address space. Only increases capacity, never decreases.
     *
     * @param {number} newCapacity - The new capacity. Must be > current capacity.
     */
    grow(newCapacity: number): void;
    /**
     * Defragment the allocator by moving allocated blocks to reduce fragmentation.
     *
     * When maxMoves is 0, performs a full compaction in a single O(n) pass: all allocated blocks
     * are packed contiguously from offset 0 and a single free block is placed at the end.
     *
     * When maxMoves > 0, performs incremental defragmentation in two phases:
     * - Phase 1 (up to maxMoves/2): relocates the last allocated block to the first fitting free
     *   gap (maximizes tail free space).
     * - Phase 2 (up to maxMoves/2): slides allocated blocks left into adjacent free gaps
     *   (cleans up interior fragmentation).
     *
     * @param {number} [maxMoves] - Maximum number of block moves. 0 = full compaction. Defaults
     * to 0.
     * @param {Set<MemBlock>} [result] - Optional Set to receive moved blocks. Defaults to a new
     * Set.
     * @returns {Set<MemBlock>} The set of MemBlocks that were moved.
     */
    defrag(maxMoves?: number, result?: Set<MemBlock>): Set<MemBlock>;
    /**
     * Full compaction: single-pass, pack all allocated blocks from offset 0.
     *
     * @param {Set<MemBlock>} result - Set to receive moved blocks.
     * @private
     */
    private _defragFull;
    /**
     * Incremental defragmentation with two phases.
     *
     * @param {number} maxMoves - Maximum total moves.
     * @param {Set<MemBlock>} result - Set to receive moved blocks.
     * @private
     */
    private _defragIncremental;
    /**
     * Move an allocated block to a free gap. The block's offset is updated in-place so caller
     * handles stay valid.
     *
     * @param {MemBlock} block - The allocated block to move.
     * @param {MemBlock} gap - The free gap to move into (must be >= block size).
     * @private
     */
    private _moveBlock;
    /**
     * Batch update: free a set of blocks and allocate new ones. Handles growth and compaction
     * internally when allocations cannot be satisfied.
     *
     * The `toAllocate` array is modified in-place: each numeric size entry is replaced with the
     * allocated {@link MemBlock}.
     *
     * @param {MemBlock[]} toFree - Blocks to release.
     * @param {Array<number|MemBlock>} toAllocate - Sizes to allocate. Modified in-place: numbers
     * are replaced with MemBlock instances.
     * @returns {boolean} True if a full defrag was performed (all existing blocks have new
     * offsets and must be re-rendered), false if only incremental allocations were made.
     */
    updateAllocation(toFree: MemBlock[], toAllocate: Array<number | MemBlock>): boolean;
}
/**
 * A node in the {@link BlockAllocator}'s linked list, representing either an allocated block or a
 * free region. Callers receive MemBlock instances as handles from {@link BlockAllocator#allocate}
 * and must not modify any properties directly.
 *
 * @ignore
 */
export class MemBlock {
    /**
     * Position in the address space.
     *
     * @private
     */
    private _offset;
    /**
     * Size of this block.
     *
     * @private
     */
    private _size;
    /**
     * True if this is a free region, false if allocated.
     *
     * @private
     */
    private _free;
    /**
     * Previous node in the main (all-nodes) list.
     *
     * @type {MemBlock|null}
     * @private
     */
    private _prev;
    /**
     * Next node in the main (all-nodes) list.
     *
     * @type {MemBlock|null}
     * @private
     */
    private _next;
    /**
     * Previous node in the bucket free-list.
     *
     * @type {MemBlock|null}
     * @private
     */
    private _prevFree;
    /**
     * Next node in the bucket free-list.
     *
     * @type {MemBlock|null}
     * @private
     */
    private _nextFree;
    /**
     * Index of the size bucket this free block belongs to, or -1 if not in any bucket.
     *
     * @private
     */
    private _bucket;
    /**
     * The offset of this block in the address space.
     *
     * @type {number}
     */
    get offset(): number;
    /**
     * The size of this block.
     *
     * @type {number}
     */
    get size(): number;
}
