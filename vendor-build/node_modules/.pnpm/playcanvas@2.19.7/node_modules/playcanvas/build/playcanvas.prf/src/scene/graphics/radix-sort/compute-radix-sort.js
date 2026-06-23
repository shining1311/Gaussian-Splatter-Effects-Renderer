import { RADIX_SORT_AUTO, RADIX_SORT_PORTABLE, RADIX_SORT_ONESWEEP } from "../../constants.js";
import { ComputeRadixSortMultipass } from "./compute-radix-sort-multipass.js";
import { ComputeRadixSortOneSweep } from "./compute-radix-sort-onesweep.js";
class ComputeRadixSort {
	_impl;
	constructor(device, options = {}) {
		const kind = options.kind ?? RADIX_SORT_AUTO;
		const indirect = options.indirect ?? false;
		let chosen = kind;
		if (kind === RADIX_SORT_AUTO) {
			chosen = this._canUseOneSweep(device) ? RADIX_SORT_ONESWEEP : RADIX_SORT_PORTABLE;
		}
		if (chosen === RADIX_SORT_ONESWEEP) {
			if (!this._canUseOneSweep(device)) {
			}
			this._impl = new ComputeRadixSortOneSweep(device, indirect);
		} else {
			this._impl = new ComputeRadixSortMultipass(device, indirect);
		}
	}
	_canUseOneSweep(device) {
		if (!device.supportsCompute || !device.supportsSubgroups) return false;
		const vendor = device.gpuAdapter?.info?.vendor?.toLowerCase?.();
		if (vendor !== "nvidia") return false;
		if (device.minSubgroupSize > 32) return false;
		return true;
	}
	get sortedIndices() {
		return this._impl.sortedIndices;
	}
	get sortedKeys() {
		return this._impl.sortedKeys;
	}
	get radixBits() {
		return this._impl.radixBits;
	}
	set capacity(value) {
		this._impl.capacity = value;
	}
	get capacity() {
		return this._impl.capacity;
	}
	sort(keysBuffer, elementCount, numBits = 16, initialValues, skipLastPassKeyWrite, destructiveKeys = false) {
		return this._impl.sort(keysBuffer, elementCount, numBits, initialValues, skipLastPassKeyWrite, destructiveKeys);
	}
	sortIndirect(keysBuffer, maxElementCount, numBits, sortSlotBase, sortElementCountBuffer, initialValues, skipLastPassKeyWrite, destructiveKeys = false) {
		return this._impl.sortIndirect(keysBuffer, maxElementCount, numBits, sortSlotBase, sortElementCountBuffer, initialValues, skipLastPassKeyWrite, destructiveKeys);
	}
	prepareIndirect() {
		return this._impl.prepareIndirect();
	}
	destroy() {
		this._impl.destroy();
	}
}
export {
	ComputeRadixSort
};
