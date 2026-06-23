var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { BUFFER_DYNAMIC, BUFFER_GPUDYNAMIC, BUFFER_STATIC, BUFFER_STREAM } from "../constants.js";
class WebglBuffer {
  constructor() {
    __publicField(this, "bufferId", null);
  }
  destroy(device) {
    if (this.bufferId) {
      device.gl.deleteBuffer(this.bufferId);
      this.bufferId = null;
    }
  }
  get initialized() {
    return !!this.bufferId;
  }
  loseContext() {
    this.bufferId = null;
  }
  unlock(device, usage, target, storage) {
    const gl = device.gl;
    if (!this.bufferId) {
      let glUsage;
      switch (usage) {
        case BUFFER_STATIC:
          glUsage = gl.STATIC_DRAW;
          break;
        case BUFFER_DYNAMIC:
          glUsage = gl.DYNAMIC_DRAW;
          break;
        case BUFFER_STREAM:
          glUsage = gl.STREAM_DRAW;
          break;
        case BUFFER_GPUDYNAMIC:
          glUsage = gl.DYNAMIC_COPY;
          break;
      }
      this.bufferId = gl.createBuffer();
      gl.bindBuffer(target, this.bufferId);
      gl.bufferData(target, storage, glUsage);
    } else {
      gl.bindBuffer(target, this.bufferId);
      gl.bufferSubData(target, 0, storage);
    }
  }
}
export {
  WebglBuffer
};
