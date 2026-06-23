class MemBlock {
	_offset = 0;
	_size = 0;
	_free = true;
	_prev = null;
	_next = null;
	_prevFree = null;
	_nextFree = null;
	_bucket = -1;
	get offset() {
		return this._offset;
	}
	get size() {
		return this._size;
	}
}
class BlockAllocator {
	_headAll = null;
	_tailAll = null;
	_freeBucketHeads = [];
	_pool = [];
	_capacity = 0;
	_usedSize = 0;
	_freeSize = 0;
	_freeRegionCount = 0;
	_growMultiplier;
	constructor(capacity = 0, growMultiplier = 1.1) {
		this._growMultiplier = growMultiplier;
		if (capacity > 0) {
			this._capacity = capacity;
			this._freeSize = capacity;
			const block = this._obtain(0, capacity, true);
			this._headAll = block;
			this._tailAll = block;
			this._addToBucket(block);
		}
	}
	get capacity() {
		return this._capacity;
	}
	get usedSize() {
		return this._usedSize;
	}
	get freeSize() {
		return this._freeSize;
	}
	get fragmentation() {
		return this._freeSize > 0 ? 1 - 1 / this._freeRegionCount : 0;
	}
	_bucketFor(size) {
		return 31 - Math.clz32(size);
	}
	_addToBucket(block) {
		const b = this._bucketFor(block._size);
		block._bucket = b;
		while (b >= this._freeBucketHeads.length) {
			this._freeBucketHeads.push(null);
		}
		block._prevFree = null;
		block._nextFree = this._freeBucketHeads[b];
		if (this._freeBucketHeads[b]) this._freeBucketHeads[b]._prevFree = block;
		this._freeBucketHeads[b] = block;
		this._freeRegionCount++;
	}
	_removeFromBucket(block) {
		const b = block._bucket;
		if (block._prevFree) block._prevFree._nextFree = block._nextFree;
		else this._freeBucketHeads[b] = block._nextFree;
		if (block._nextFree) block._nextFree._prevFree = block._prevFree;
		block._prevFree = null;
		block._nextFree = null;
		block._bucket = -1;
		this._freeRegionCount--;
	}
	_rebucket(block) {
		const newBucket = this._bucketFor(block._size);
		if (newBucket !== block._bucket) {
			this._removeFromBucket(block);
			this._addToBucket(block);
		}
	}
	_obtain(offset, size, free) {
		let block;
		if (this._pool.length > 0) {
			block = this._pool.pop();
		} else {
			block = new MemBlock();
		}
		block._offset = offset;
		block._size = size;
		block._free = free;
		block._prev = null;
		block._next = null;
		block._prevFree = null;
		block._nextFree = null;
		block._bucket = -1;
		return block;
	}
	_release(block) {
		block._prev = null;
		block._next = null;
		block._prevFree = null;
		block._nextFree = null;
		block._bucket = -1;
		this._pool.push(block);
	}
	_insertAfterInMainList(block, after) {
		if (after === null) {
			block._prev = null;
			block._next = this._headAll;
			if (this._headAll) this._headAll._prev = block;
			this._headAll = block;
			if (!this._tailAll) this._tailAll = block;
		} else {
			block._prev = after;
			block._next = after._next;
			if (after._next) after._next._prev = block;
			after._next = block;
			if (this._tailAll === after) this._tailAll = block;
		}
	}
	_removeFromMainList(block) {
		if (block._prev) block._prev._next = block._next;
		else this._headAll = block._next;
		if (block._next) block._next._prev = block._prev;
		else this._tailAll = block._prev;
		block._prev = null;
		block._next = null;
	}
	_findFreeBlock(size) {
		const startBucket = this._bucketFor(size);
		const len = this._freeBucketHeads.length;
		if (startBucket < len) {
			let best = null;
			let node = this._freeBucketHeads[startBucket];
			while (node) {
				if (node._size >= size) {
					if (!best || node._size < best._size) {
						best = node;
						if (node._size === size) break;
					}
				}
				node = node._nextFree;
			}
			if (best) return best;
		}
		for (let b = startBucket + 1; b < len; b++) {
			if (this._freeBucketHeads[b]) {
				return this._freeBucketHeads[b];
			}
		}
		return null;
	}
	allocate(size) {
		const gap = this._findFreeBlock(size);
		if (!gap) return null;
		this._usedSize += size;
		this._freeSize -= size;
		if (gap._size === size) {
			gap._free = false;
			this._removeFromBucket(gap);
			return gap;
		}
		const alloc = this._obtain(gap._offset, size, false);
		gap._offset += size;
		gap._size -= size;
		this._rebucket(gap);
		this._insertAfterInMainList(alloc, gap._prev);
		return alloc;
	}
	free(block) {
		block._free = true;
		this._usedSize -= block._size;
		this._freeSize += block._size;
		const prev = block._prev;
		const next = block._next;
		const prevFree = prev && prev._free;
		const nextFree = next && next._free;
		if (prevFree && nextFree) {
			prev._size += block._size + next._size;
			this._removeFromMainList(block);
			this._removeFromMainList(next);
			this._removeFromBucket(next);
			this._release(block);
			this._release(next);
			this._rebucket(prev);
		} else if (prevFree) {
			prev._size += block._size;
			this._removeFromMainList(block);
			this._release(block);
			this._rebucket(prev);
		} else if (nextFree) {
			block._size += next._size;
			this._removeFromMainList(next);
			this._removeFromBucket(next);
			this._release(next);
			this._addToBucket(block);
		} else {
			this._addToBucket(block);
		}
	}
	grow(newCapacity) {
		if (newCapacity <= this._capacity) return;
		const added = newCapacity - this._capacity;
		this._capacity = newCapacity;
		this._freeSize += added;
		if (this._tailAll && this._tailAll._free) {
			this._tailAll._size += added;
			this._rebucket(this._tailAll);
		} else {
			const block = this._obtain(this._capacity - added, added, true);
			this._insertAfterInMainList(block, this._tailAll);
			this._addToBucket(block);
		}
	}
	defrag(maxMoves = 0, result = /* @__PURE__ */ new Set()) {
		result.clear();
		if (this._freeRegionCount === 0) return result;
		if (maxMoves === 0) {
			this._defragFull(result);
		} else {
			this._defragIncremental(maxMoves, result);
		}
		return result;
	}
	_defragFull(result) {
		for (let b = 0; b < this._freeBucketHeads.length; b++) {
			let node = this._freeBucketHeads[b];
			while (node) {
				const nextFree = node._nextFree;
				this._removeFromMainList(node);
				node._prevFree = null;
				node._nextFree = null;
				node._bucket = -1;
				this._pool.push(node);
				node = nextFree;
			}
			this._freeBucketHeads[b] = null;
		}
		this._freeRegionCount = 0;
		let offset = 0;
		let block = this._headAll;
		while (block) {
			if (block._offset !== offset) {
				block._offset = offset;
				result.add(block);
			}
			offset += block._size;
			block = block._next;
		}
		const remaining = this._capacity - offset;
		if (remaining > 0) {
			const freeBlock = this._obtain(offset, remaining, true);
			this._insertAfterInMainList(freeBlock, this._tailAll);
			this._addToBucket(freeBlock);
		}
	}
	_defragIncremental(maxMoves, result) {
		const phase1Moves = Math.ceil(maxMoves / 2);
		const phase2Moves = maxMoves - phase1Moves;
		for (let i = 0; i < phase1Moves; i++) {
			let lastAlloc = this._tailAll;
			while (lastAlloc && lastAlloc._free) lastAlloc = lastAlloc._prev;
			if (!lastAlloc) break;
			const gap = this._findFreeBlock(lastAlloc._size);
			if (!gap || gap._offset >= lastAlloc._offset) break;
			this._moveBlock(lastAlloc, gap);
			result.add(lastAlloc);
		}
		let block = this._headAll;
		for (let i = 0; i < phase2Moves && block; ) {
			const next = block._next;
			if (block._free && next && !next._free) {
				const allocBlock = next;
				const freeBlock = block;
				allocBlock._offset = freeBlock._offset;
				freeBlock._offset = allocBlock._offset + allocBlock._size;
				const a = freeBlock._prev;
				const b = allocBlock._next;
				allocBlock._prev = a;
				allocBlock._next = freeBlock;
				freeBlock._prev = allocBlock;
				freeBlock._next = b;
				if (a) a._next = allocBlock;
				else this._headAll = allocBlock;
				if (b) b._prev = freeBlock;
				else this._tailAll = freeBlock;
				if (freeBlock._next && freeBlock._next._free) {
					const right = freeBlock._next;
					freeBlock._size += right._size;
					this._removeFromMainList(right);
					this._removeFromBucket(right);
					this._release(right);
					this._rebucket(freeBlock);
				}
				result.add(allocBlock);
				i++;
				block = freeBlock._next;
			} else {
				block = next;
			}
		}
	}
	_moveBlock(block, gap) {
		const blockSize = block._size;
		const newOffset = gap._offset;
		const prev = block._prev;
		this._removeFromMainList(block);
		const freed = this._obtain(block._offset, blockSize, true);
		this._insertAfterInMainList(freed, prev);
		this._addToBucket(freed);
		if (freed._next && freed._next._free) {
			const right = freed._next;
			freed._size += right._size;
			this._removeFromMainList(right);
			this._removeFromBucket(right);
			this._release(right);
			this._rebucket(freed);
		}
		if (freed._prev && freed._prev._free) {
			const left = freed._prev;
			left._size += freed._size;
			this._removeFromMainList(freed);
			this._removeFromBucket(freed);
			this._release(freed);
			this._rebucket(left);
		}
		block._offset = newOffset;
		if (gap._size === blockSize) {
			const gapPrev = gap._prev;
			this._removeFromMainList(gap);
			this._removeFromBucket(gap);
			this._release(gap);
			this._insertAfterInMainList(block, gapPrev);
		} else {
			gap._offset += blockSize;
			gap._size -= blockSize;
			this._rebucket(gap);
			this._insertAfterInMainList(block, gap._prev);
		}
	}
	updateAllocation(toFree, toAllocate) {
		for (let i = 0; i < toFree.length; i++) {
			this.free(toFree[i]);
		}
		for (let i = 0; i < toAllocate.length; i++) {
			const size = toAllocate[i];
			const block = this.allocate(size);
			if (block) {
				toAllocate[i] = block;
			} else {
				let totalRemaining = size;
				for (let j = i + 1; j < toAllocate.length; j++) {
					totalRemaining += toAllocate[j];
				}
				const neededCapacity = this._usedSize + totalRemaining;
				const headroomCapacity = Math.ceil(neededCapacity * this._growMultiplier);
				if (headroomCapacity > this._capacity) {
					this.grow(headroomCapacity);
				}
				this.defrag(0);
				for (let j = i; j < toAllocate.length; j++) {
					const s = toAllocate[j];
					const b = this.allocate(s);
					toAllocate[j] = b;
				}
				return true;
			}
		}
		return false;
	}
}
export {
	BlockAllocator,
	MemBlock
};
