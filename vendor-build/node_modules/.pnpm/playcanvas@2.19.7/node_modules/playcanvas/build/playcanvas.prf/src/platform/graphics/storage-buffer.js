import { TRACEID_VRAM_SB } from "../../core/constants.js";
import { BUFFERUSAGE_STORAGE } from "./constants.js";
let id = 0;
class StorageBuffer {
	id = id++;
	constructor(graphicsDevice, byteSize, bufferUsage = 0, addStorageUsage = true) {
		this.device = graphicsDevice;
		this.byteSize = byteSize;
		this.bufferUsage = bufferUsage;
		const usage = addStorageUsage ? BUFFERUSAGE_STORAGE | bufferUsage : bufferUsage;
		this.impl = graphicsDevice.createBufferImpl(usage);
		this.impl.allocate(graphicsDevice, byteSize);
		graphicsDevice.buffers.add(this);
		this.adjustVramSizeTracking(graphicsDevice._vram, this.byteSize);
	}
	destroy() {
		const device = this.device;
		device.buffers.delete(this);
		this.impl.destroy(device);
		this.adjustVramSizeTracking(device._vram, -this.byteSize);
	}
	loseContext() {
		this.impl.loseContext();
	}
	restoreContext() {
		this.impl.allocate(this.device, this.byteSize);
	}
	adjustVramSizeTracking(vram, size) {
		vram.sb += size;
	}
	read(offset = 0, size = this.byteSize, data = null, immediate = false) {
		return this.impl.read(this.device, offset, size, data, immediate);
	}
	write(bufferOffset = 0, data, dataOffset = 0, size) {
		this.impl.write(this.device, bufferOffset, data, dataOffset, size);
	}
	clear(offset = 0, size = this.byteSize) {
		this.impl.clear(this.device, offset, size);
	}
	copy(srcBuffer, srcOffset = 0, dstOffset = 0, size = srcBuffer.byteSize - srcOffset) {
		const commandEncoder = this.device.getCommandEncoder();
		commandEncoder.copyBufferToBuffer(srcBuffer.impl.buffer, srcOffset, this.impl.buffer, dstOffset, size);
	}
}
export {
	StorageBuffer
};
