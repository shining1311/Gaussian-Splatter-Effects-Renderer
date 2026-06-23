import { TRACEID_RENDER_QUEUE } from "../../../core/constants.js";
class WebgpuBuffer {
	buffer = null;
	usageFlags = 0;
	constructor(usageFlags = 0) {
		this.usageFlags = usageFlags;
	}
	destroy(device) {
		if (this.buffer) {
			device.deferDestroy(this.buffer);
			this.buffer = null;
		}
	}
	get initialized() {
		return !!this.buffer;
	}
	loseContext() {
		this.buffer = null;
	}
	allocate(device, size) {
		this.buffer = device.wgpu.createBuffer({
			size,
			usage: this.usageFlags
		});
	}
	unlock(device, storage) {
		const wgpu = device.wgpu;
		if (!this.buffer) {
			const size = storage.byteLength + 3 & ~3;
			this.usageFlags |= GPUBufferUsage.COPY_DST;
			this.allocate(device, size);
		}
		const srcOffset = storage.byteOffset ?? 0;
		const srcData = new Uint8Array(storage.buffer ?? storage, srcOffset, storage.byteLength);
		const data = new Uint8Array(this.buffer.size);
		data.set(srcData);
		wgpu.queue.writeBuffer(this.buffer, 0, data, 0, data.length);
	}
	read(device, offset, size, data, immediate) {
		return device.readStorageBuffer(this, offset, size, data, immediate);
	}
	write(device, bufferOffset, data, dataOffset, size) {
		device.writeStorageBuffer(this, bufferOffset, data, dataOffset, size);
	}
	clear(device, offset, size) {
		device.clearStorageBuffer(this, offset, size);
	}
}
export {
	WebgpuBuffer
};
