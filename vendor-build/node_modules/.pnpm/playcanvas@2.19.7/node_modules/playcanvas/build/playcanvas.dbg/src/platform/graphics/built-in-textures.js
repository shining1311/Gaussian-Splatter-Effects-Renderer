var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../core/debug.js";
import { PIXELFORMAT_RGBA8 } from "./constants.js";
import { DeviceCache } from "./device-cache.js";
import { Texture } from "./texture.js";
const textureData = {
  white: [255, 255, 255, 255],
  gray: [128, 128, 128, 255],
  black: [0, 0, 0, 255],
  normal: [128, 128, 255, 255],
  pink: [255, 128, 255, 255]
};
class BuiltInTextures {
  constructor() {
    /** @type Map<string, Texture> */
    __publicField(this, "map", /* @__PURE__ */ new Map());
  }
  destroy() {
    this.map.forEach((texture) => {
      texture.destroy();
    });
  }
}
const deviceCache = new DeviceCache();
const getBuiltInTexture = (device, name) => {
  const cache = deviceCache.get(device, () => {
    return new BuiltInTextures();
  });
  if (!cache.map.has(name)) {
    const texture = new Texture(device, {
      name: `built-in-texture-${name}`,
      width: 1,
      height: 1,
      format: PIXELFORMAT_RGBA8
    });
    const pixels = texture.lock();
    const data = textureData[name];
    Debug.assert(data, `Data for built-in texture '${name}' not found`);
    pixels.set(data);
    texture.unlock();
    cache.map.set(name, texture);
  }
  return cache.map.get(name);
};
export {
  getBuiltInTexture
};
