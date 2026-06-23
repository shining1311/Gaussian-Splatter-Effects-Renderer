var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../../core/debug.js";
import { INDEXFORMAT_UINT8, INDEXFORMAT_UINT16, BUFFERUSAGE_INDEX, BUFFERUSAGE_STORAGE } from "../constants.js";
import { WebgpuBuffer } from "./webgpu-buffer.js";
class WebgpuIndexBuffer extends WebgpuBuffer {
  constructor(indexBuffer, options) {
    super(BUFFERUSAGE_INDEX | (options?.storage ? BUFFERUSAGE_STORAGE : 0));
    __publicField(this, "format", null);
    Debug.assert(indexBuffer.format !== INDEXFORMAT_UINT8, "WebGPU does not support 8-bit index buffer format");
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
