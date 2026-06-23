import { math } from "../../core/math/math.js";
class UsedBuffer {
	gpuBuffer;
	stagingBuffer;
	offset;
	size;
}
class DynamicBufferAllocation {
	storage;
	gpuBuffer;
	offset;
}
class DynamicBuffers {
	bufferSize;
	gpuBuffers = [];
	stagingBuffers = [];
	usedBuffers = [];
	activeBuffer = null;
	constructor(device, bufferSize, bufferAlignment) {
		this.device = device;
		this.bufferSize = bufferSize;
		this.bufferAlignment = bufferAlignment;
	}
	destroy() {
		this.gpuBuffers.forEach((gpuBuffer) => {
			gpuBuffer.destroy(this.device);
		});
		this.gpuBuffers = null;
		this.stagingBuffers.forEach((stagingBuffer) => {
			stagingBuffer.destroy(this.device);
		});
		this.stagingBuffers = null;
		this.usedBuffers = null;
		this.activeBuffer = null;
	}
	alloc(allocation, size) {
		if (this.activeBuffer) {
			const alignedStart2 = math.roundUp(this.activeBuffer.size, this.bufferAlignment);
			const space = this.bufferSize - alignedStart2;
			if (space < size) {
				this.scheduleSubmit();
			}
		}
		if (!this.activeBuffer) {
			let gpuBuffer = this.gpuBuffers.pop();
			if (!gpuBuffer) {
				gpuBuffer = this.createBuffer(this.device, this.bufferSize, false);
			}
			let stagingBuffer = this.stagingBuffers.pop();
			if (!stagingBuffer) {
				stagingBuffer = this.createBuffer(this.device, this.bufferSize, true);
			}
			this.activeBuffer = new UsedBuffer();
			this.activeBuffer.stagingBuffer = stagingBuffer;
			this.activeBuffer.gpuBuffer = gpuBuffer;
			this.activeBuffer.offset = 0;
			this.activeBuffer.size = 0;
		}
		const activeBuffer = this.activeBuffer;
		const alignedStart = math.roundUp(activeBuffer.size, this.bufferAlignment);
		allocation.gpuBuffer = activeBuffer.gpuBuffer;
		allocation.offset = alignedStart;
		allocation.storage = activeBuffer.stagingBuffer.alloc(alignedStart, size);
		activeBuffer.size = alignedStart + size;
	}
	scheduleSubmit() {
		if (this.activeBuffer) {
			this.usedBuffers.push(this.activeBuffer);
			this.activeBuffer = null;
		}
	}
	submit() {
		this.scheduleSubmit();
	}
}
export {
	DynamicBufferAllocation,
	DynamicBuffers
};
