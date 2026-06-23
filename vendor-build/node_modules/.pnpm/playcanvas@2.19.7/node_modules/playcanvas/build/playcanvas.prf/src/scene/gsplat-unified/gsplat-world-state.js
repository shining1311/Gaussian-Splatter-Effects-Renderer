const _newAllocIds = /* @__PURE__ */ new Set();
const _toAllocateIds = [];
const _toAllocate = [];
const _toFree = [];
class GSplatWorldState {
	version = 0;
	sortParametersSet = false;
	sortedBefore = false;
	splats = [];
	textureSize = 0;
	totalActiveSplats = 0;
	totalIntervals = 0;
	boundsGroups = [];
	pendingReleases = [];
	needsUpload = [];
	needsUploadIds = /* @__PURE__ */ new Set();
	allocIdToSplat = /* @__PURE__ */ new Map();
	fullRebuild = false;
	constructor(device, version, splats, allocator, allocationMap) {
		this.version = version;
		this.splats = splats;
		if (splats.length === 0) {
			for (const [, block] of allocationMap) {
				allocator.free(block);
			}
			allocationMap.clear();
			this.totalActiveSplats = 0;
			this.totalIntervals = 0;
			this.textureSize = 1;
			return;
		}
		this.computeAllocationDiff(splats, allocationMap);
		const { fullRebuild, changedAllocIds } = this.applyAllocations(device, allocator, allocationMap);
		this.assignSplatOffsets(splats, allocationMap, fullRebuild, changedAllocIds);
		this.buildBoundsGroups(splats);
	}
	destroy() {
		this.splats.forEach((splat) => splat.destroy());
		this.splats.length = 0;
		this.needsUpload.length = 0;
		this.needsUploadIds.clear();
		this.allocIdToSplat.clear();
		this.boundsGroups.length = 0;
	}
	computeAllocationDiff(splats, allocationMap) {
		for (let i = 0; i < splats.length; i++) {
			const splat = splats[i];
			const allocIds = splat.intervalAllocIds;
			const intervals = splat.intervals;
			const numIntervals = intervals.length / 2;
			if (numIntervals > 0 && allocIds.length === numIntervals) {
				for (let j = 0; j < numIntervals; j++) {
					this._diffAlloc(allocIds[j], intervals[j * 2 + 1] - intervals[j * 2], allocationMap);
				}
			} else {
				this._diffAlloc(splat.allocId, splat.activeSplats, allocationMap);
			}
		}
		for (const [allocId, block] of allocationMap) {
			if (!_newAllocIds.has(allocId)) {
				_toFree.push(block);
				allocationMap.delete(allocId);
			}
		}
	}
	_diffAlloc(allocId, size, allocationMap) {
		_newAllocIds.add(allocId);
		const existing = allocationMap.get(allocId);
		if (existing) {
			if (existing.size !== size) {
				_toFree.push(existing);
				allocationMap.delete(allocId);
				if (size > 0) {
					_toAllocateIds.push(allocId);
					_toAllocate.push(size);
				}
			}
		} else if (size > 0) {
			_toAllocateIds.push(allocId);
			_toAllocate.push(size);
		}
	}
	applyAllocations(device, allocator, allocationMap) {
		let fullRebuild = false;
		if (_toFree.length > 0 || _toAllocate.length > 0) {
			fullRebuild = allocator.updateAllocation(_toFree, _toAllocate);
			for (let i = 0; i < _toAllocateIds.length; i++) {
				allocationMap.set(_toAllocateIds[i], _toAllocate[i]);
			}
		}
		this.fullRebuild = fullRebuild;
		const churn = _toFree.length + _toAllocateIds.length;
		const incrementalDefragMoves = Math.max(50, churn);
		if (!fullRebuild && allocator.fragmentation > 0.3) {
			const moved = allocator.defrag(incrementalDefragMoves);
			if (moved.size > 0) {
				for (const [allocId, block] of allocationMap) {
					if (moved.has(block)) {
						_toAllocateIds.push(allocId);
					}
				}
			}
		}
		const cap = allocator.capacity;
		this.textureSize = cap > 0 ? Math.ceil(Math.sqrt(cap)) : 1;
		const changedAllocIds = _toAllocateIds.length > 0 ? new Set(_toAllocateIds) : null;
		_newAllocIds.clear();
		_toAllocateIds.length = 0;
		_toAllocate.length = 0;
		_toFree.length = 0;
		return { fullRebuild, changedAllocIds };
	}
	assignSplatOffsets(splats, allocationMap, fullRebuild, changedAllocIds) {
		let totalActiveSplats = 0;
		let totalIntervals = 0;
		for (let i = 0; i < splats.length; i++) {
			const splat = splats[i];
			const allocIds = splat.intervalAllocIds;
			const intervals = splat.intervals;
			const numIntervals = intervals.length / 2;
			totalIntervals += numIntervals > 0 ? numIntervals : 1;
			let splatChanged = fullRebuild;
			const intervalOffsets = [];
			if (numIntervals > 0 && allocIds.length === numIntervals) {
				for (let j = 0; j < numIntervals; j++) {
					this.allocIdToSplat.set(allocIds[j], splat);
					const block = allocationMap.get(allocIds[j]);
					if (block) {
						intervalOffsets.push(block.offset);
						totalActiveSplats += intervals[j * 2 + 1] - intervals[j * 2];
						if (changedAllocIds && changedAllocIds.has(allocIds[j])) {
							splatChanged = true;
							this.needsUploadIds.add(allocIds[j]);
						}
					}
				}
			} else {
				this.allocIdToSplat.set(splat.allocId, splat);
				const block = allocationMap.get(splat.allocId);
				if (block) {
					intervalOffsets.push(block.offset);
					totalActiveSplats += splat.activeSplats;
					if (changedAllocIds && changedAllocIds.has(splat.allocId)) {
						splatChanged = true;
						this.needsUploadIds.add(splat.allocId);
					}
				}
			}
			if (intervalOffsets.length > 0) {
				splat.setLayout(intervalOffsets);
				if (splatChanged) {
					this.needsUpload.push(splat);
					if (fullRebuild) {
						for (let j = 0; j < allocIds.length; j++) {
							this.needsUploadIds.add(allocIds[j]);
						}
					}
				}
			}
		}
		this.totalActiveSplats = totalActiveSplats;
		this.totalIntervals = totalIntervals;
	}
	buildBoundsGroups(splats) {
		const groupMap = /* @__PURE__ */ new Map();
		for (let i = 0; i < splats.length; i++) {
			const splat = splats[i];
			const key = splat.parentPlacementId;
			if (!groupMap.has(key)) {
				groupMap.set(key, {
					splat,
					boundsBaseIndex: 0,
					numBoundsEntries: splat.numBoundsEntries
				});
			}
		}
		let boundsIndex = 0;
		for (const group of groupMap.values()) {
			group.boundsBaseIndex = boundsIndex;
			boundsIndex += group.numBoundsEntries;
			this.boundsGroups.push(group);
		}
		for (let i = 0; i < splats.length; i++) {
			const group = groupMap.get(splats[i].parentPlacementId);
			splats[i].boundsBaseIndex = group.boundsBaseIndex;
		}
	}
}
export {
	GSplatWorldState
};
