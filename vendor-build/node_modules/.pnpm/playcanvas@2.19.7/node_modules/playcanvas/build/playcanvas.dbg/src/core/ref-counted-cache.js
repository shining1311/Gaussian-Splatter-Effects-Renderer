var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class RefCountedCache {
  constructor() {
    /**
     * The cache. The key is the object being stored in the cache. The value is ref count of the
     * object. When that reaches zero, destroy function on the object gets called and object is
     * removed from the cache.
     *
     * @type {Map<object, number>}
     */
    __publicField(this, "cache", /* @__PURE__ */ new Map());
  }
  /**
   * Destroy all stored objects.
   */
  destroy() {
    this.cache.forEach((refCount, object) => {
      object.destroy();
    });
    this.cache.clear();
  }
  /**
   * Add object reference to the cache.
   *
   * @param {object} object - The object to add.
   */
  incRef(object) {
    const refCount = (this.cache.get(object) || 0) + 1;
    this.cache.set(object, refCount);
  }
  /**
   * Remove object reference from the cache.
   *
   * @param {object} object - The object to remove.
   */
  decRef(object) {
    if (object) {
      let refCount = this.cache.get(object);
      if (refCount) {
        refCount--;
        if (refCount === 0) {
          this.cache.delete(object);
          object.destroy();
        } else {
          this.cache.set(object, refCount);
        }
      }
    }
  }
}
export {
  RefCountedCache
};
