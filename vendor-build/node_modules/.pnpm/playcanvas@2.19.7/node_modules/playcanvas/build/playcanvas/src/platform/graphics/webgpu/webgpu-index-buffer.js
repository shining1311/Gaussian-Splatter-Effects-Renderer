import { INDEXFORMAT_UINT8, INDEXFORMAT_UINT16, BUFFERUSAGE_INDEX, BUFFERUSAGE_STORAGE } from "../constants.js";
import { WebgpuBuffer } from "./webgpu-buffer.js";
class WebgpuIndexBuffer extends WebgpuBuffer {
	format = null;
	constructor(indexBuffer, options) {
		super(BUFFERUSAGE_INDEX | (options?.storage ? BUFFERUSAGE_STORAGE : 0));
		this.format = indexBuffer.format === INDEXFORMAT_UINT16 ? "uint16" : "uint32";
	}
	unlock(indexBuffer) {
		const device = indexBuffer.device;
		super.unlock(device, indexBuffer.storage);
	}
}
export {
	WebgpuIndexBuffer
};
