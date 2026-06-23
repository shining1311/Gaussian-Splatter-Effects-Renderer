var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { WebglBuffer } from "./webgl-buffer.js";
class WebglVertexBuffer extends WebglBuffer {
  constructor() {
    super(...arguments);
    // vertex array object
    __publicField(this, "vao", null);
  }
  destroy(device) {
    super.destroy(device);
    device.unbindVertexArray();
  }
  loseContext() {
    super.loseContext();
    this.vao = null;
  }
  unlock(vertexBuffer) {
    const device = vertexBuffer.device;
    super.unlock(device, vertexBuffer.usage, device.gl.ARRAY_BUFFER, vertexBuffer.storage);
  }
}
export {
  WebglVertexBuffer
};
