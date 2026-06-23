var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { DebugHelper } from "../../../core/debug.js";
import { DynamicBuffer } from "../dynamic-buffer.js";
class WebgpuDynamicBuffer extends DynamicBuffer {
  constructor(device, size, isStaging) {
    super(device);
    /**
     * @type {GPUBuffer}
     * @private
     */
    __publicField(this, "buffer", null);
    /**
     * CPU access over the whole buffer.
     *
     * @type {ArrayBuffer}
     */
    __publicField(this, "mappedRange", null);
    this.buffer = device.wgpu.createBuffer({
      size,
      usage: isStaging ? GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC : GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: isStaging
    });
    if (isStaging) {
      this.onAvailable();
    }
    device._vram.ub += size;
    DebugHelper.setLabel(this.buffer, `DynamicBuffer-${isStaging ? "Staging" : "Gpu"}`);
  }
  destroy(device) {
    device._vram.ub -= this.buffer.size;
    this.buffer.destroy();
    this.buffer = null;
  }
  /**
   * Called when the staging buffer is mapped for writing.
   */
  onAvailable() {
    this.mappedRange = this.buffer.getMappedRange();
  }
  alloc(offset, size) {
    return new Int32Array(this.mappedRange, offset, size / 4);
  }
}
export {
  WebgpuDynamicBuffer
};
