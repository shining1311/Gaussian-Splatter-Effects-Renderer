var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class DeviceCache {
  constructor() {
    /**
     * Cache storing the resource for each GraphicsDevice
     *
     * @type {Map<GraphicsDevice, any>}
     */
    __publicField(this, "_cache", /* @__PURE__ */ new Map());
  }
  /**
   * Returns the resources for the supplied device.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {() => any} onCreate - A function that creates the resource for the device.
   * @returns {any} The resource for the device.
   */
  get(device, onCreate) {
    if (!this._cache.has(device)) {
      this._cache.set(device, onCreate());
      device.on("destroy", () => {
        this.remove(device);
      });
      device.on("devicelost", () => {
        this._cache.get(device)?.loseContext?.(device);
      });
    }
    return this._cache.get(device);
  }
  /**
   * Destroys and removes the content of the cache associated with the device
   *
   * @param {GraphicsDevice} device - The graphics device.
   */
  remove(device) {
    this._cache.get(device)?.destroy?.(device);
    this._cache.delete(device);
  }
}
export {
  DeviceCache
};
