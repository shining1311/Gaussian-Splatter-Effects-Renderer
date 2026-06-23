var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../core/debug.js";
import { math } from "../../core/math/math.js";
class UsedBuffer {
  constructor() {
    /** @type {DynamicBuffer} */
    __publicField(this, "gpuBuffer");
    /** @type {DynamicBuffer} */
    __publicField(this, "stagingBuffer");
    /**
     * The beginning position of the used area that needs to be copied from staging to the GPU
     * buffer.
     *
     * @type {number}
     */
    __publicField(this, "offset");
    /**
     * Used byte size of the buffer, from the offset.
     *
     * @type {number}
     */
    __publicField(this, "size");
  }
}
class DynamicBufferAllocation {
  constructor() {
    /**
     * The storage access to the allocated data in the staging buffer.
     *
     * @type {Int32Array}
     */
    __publicField(this, "storage");
    /**
     * The gpu buffer this allocation will be copied to.
     *
     * @type {DynamicBuffer}
     */
    __publicField(this, "gpuBuffer");
    /**
     * Offset in the gpuBuffer where the data will be copied to.
     *
     * @type {number}
     */
    __publicField(this, "offset");
  }
}
class DynamicBuffers {
  /**
   * Create the system of dynamic buffers.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {number} bufferSize - The size of the underlying large buffers.
   * @param {number} bufferAlignment - Alignment of each allocation.
   */
  constructor(device, bufferSize, bufferAlignment) {
    /**
     * Allocation size of the underlying buffers.
     *
     * @type {number}
     */
    __publicField(this, "bufferSize");
    /**
     * Internally allocated gpu buffers.
     *
     * @type {DynamicBuffer[]}
     */
    __publicField(this, "gpuBuffers", []);
    /**
     * Internally allocated staging buffers (CPU writable)
     *
     * @type {DynamicBuffer[]}
     */
    __publicField(this, "stagingBuffers", []);
    /**
     * @type {UsedBuffer[]}
     */
    __publicField(this, "usedBuffers", []);
    /**
     * @type {UsedBuffer|null}
     */
    __publicField(this, "activeBuffer", null);
    this.device = device;
    this.bufferSize = bufferSize;
    this.bufferAlignment = bufferAlignment;
  }
  /**
   * Destroy the system of dynamic buffers.
   */
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
  /**
   * Allocate an aligned space of the given size from a dynamic buffer.
   *
   * @param {DynamicBufferAllocation} allocation - The allocation info to fill.
   * @param {number} size - The size of the allocation.
   */
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
    Debug.assert(alignedStart + size <= this.bufferSize, `The allocation size of ${size} is larger than the buffer size of ${this.bufferSize}`);
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
