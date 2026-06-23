var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { RefCountedCache } from "../../core/ref-counted-cache.js";
class LightmapCache {
  // add texture reference to lightmap cache
  static incRef(texture) {
    this.cache.incRef(texture);
  }
  // remove texture reference from lightmap cache
  static decRef(texture) {
    this.cache.decRef(texture);
  }
  static destroy() {
    this.cache.destroy();
  }
}
__publicField(LightmapCache, "cache", new RefCountedCache());
export {
  LightmapCache
};
