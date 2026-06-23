class DrawCommands {
	device;
	indexSizeBytes;
	_maxCount = 0;
	get maxCount() {
		return this._maxCount;
	}
	impl = null;
	_count = 1;
	get count() {
		return this._count;
	}
	slotIndex = 0;
	primitiveCount = 0;
	constructor(device, indexSizeBytes = 0) {
		this.device = device;
		this.indexSizeBytes = indexSizeBytes;
		this.impl = device.createDrawCommandImpl(this);
	}
	destroy() {
		this.impl?.destroy?.();
		this.impl = null;
	}
	allocate(maxCount) {
		this._maxCount = maxCount;
		this.impl.allocate?.(maxCount);
	}
	add(i, indexOrVertexCount, instanceCount, firstIndexOrVertex, baseVertex = 0, firstInstance = 0) {
		this.impl.add(i, indexOrVertexCount, instanceCount, firstIndexOrVertex, baseVertex, firstInstance);
	}
	update(count) {
		this._count = count;
		this.primitiveCount = this.impl.update?.(count) ?? 0;
	}
}
export {
	DrawCommands
};
