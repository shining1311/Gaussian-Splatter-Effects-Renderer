import { BUFFERUSAGE_COPY_DST, BUFFERUSAGE_COPY_SRC } from "../../../platform/graphics/constants.js";
import { StorageBuffer } from "../../../platform/graphics/storage-buffer.js";
class ComputeRadixSortBase {
	device;
	_indirect = false;
	constructor(device, indirect = false) {
		this.device = device;
		this._indirect = indirect;
	}
	capacity = 0;
	_elementCount = 0;
	_numBits = 0;
	_hasInitialValues = false;
	_skipLastPassKeyWrite = false;
	_destructiveKeys = false;
	_keys0 = null;
	_keys1 = null;
	_values0 = null;
	_values1 = null;
	_indirectInfo = new Uint32Array(4);
	get sortedIndices() {
		if (!this._values0) return null;
		const numPasses = this._numBits / this.radixBits;
		return numPasses % 2 === 1 ? this._values1 : this._values0;
	}
	get sortedKeys() {
		if (!this._keys0) {
			return null;
		}
		const radix = this.radixBits;
		const numPasses = this._numBits / radix;
		return numPasses % 2 === 0 ? this._keys1 : this._keys0;
	}
	get radixBits() {
		return 0;
	}
	sort(keysBuffer, elementCount, numBits, initialValues, skipLastPassKeyWrite, destructiveKeys) {
		return null;
	}
	sortIndirect(keysBuffer, maxElementCount, numBits, sortSlotBase, sortElementCountBuffer, initialValues, skipLastPassKeyWrite, destructiveKeys) {
		return null;
	}
	prepareIndirect() {
		return this._indirectInfo;
	}
	_allocatePingPongElementBuffers(effectiveCount) {
		const elementSize = effectiveCount * 4;
		const usage = BUFFERUSAGE_COPY_SRC | BUFFERUSAGE_COPY_DST;
		const device = this.device;
		this._keys0 = new StorageBuffer(device, elementSize, usage);
		if (!this._destructiveKeys) {
			this._keys1 = new StorageBuffer(device, elementSize, usage);
		}
		this._values0 = new StorageBuffer(device, elementSize, usage);
		this._values1 = new StorageBuffer(device, elementSize, usage);
	}
	_destroyPingPongBuffers() {
		this._keys0?.destroy();
		if (!this._destructiveKeys) this._keys1?.destroy();
		this._values0?.destroy();
		this._values1?.destroy();
		this._keys0 = null;
		this._keys1 = null;
		this._values0 = null;
		this._values1 = null;
	}
	destroy() {
	}
}
export {
	ComputeRadixSortBase
};
