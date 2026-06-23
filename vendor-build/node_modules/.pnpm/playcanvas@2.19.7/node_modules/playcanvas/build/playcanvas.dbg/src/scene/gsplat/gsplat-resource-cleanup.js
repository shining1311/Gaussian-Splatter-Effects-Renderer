var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { DeviceCache } from "../../platform/graphics/device-cache.js";
const _GSplatResourceCleanup = class _GSplatResourceCleanup {
  constructor() {
    /** @type {Set<GSplatResourceBase>} */
    __publicField(this, "_pendingDestroy", /* @__PURE__ */ new Set());
  }
  /**
   * Queue a resource for deferred destruction.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {GSplatResourceBase} resource - The resource to destroy later.
   */
  static queueDestroy(device, resource) {
    this._cache.get(device, () => new _GSplatResourceCleanup())._pendingDestroy.add(resource);
  }
  /**
   * Process pending resource destructions for a device. Called by GSplatDirector.update().
   *
   * @param {GraphicsDevice} device - The graphics device.
   */
  static process(device) {
    const pending = this._cache.get(device, () => new _GSplatResourceCleanup())._pendingDestroy;
    for (const resource of pending) {
      if (resource.refCount === 0) {
        resource._actualDestroy();
        pending.delete(resource);
      }
    }
  }
  /**
   * Called by DeviceCache when device is destroyed.
   * Just releases references - GPU resources are already gone.
   */
  destroy() {
    this._pendingDestroy.clear();
  }
};
/** @type {DeviceCache} */
__publicField(_GSplatResourceCleanup, "_cache", new DeviceCache());
let GSplatResourceCleanup = _GSplatResourceCleanup;
export {
  GSplatResourceCleanup
};
