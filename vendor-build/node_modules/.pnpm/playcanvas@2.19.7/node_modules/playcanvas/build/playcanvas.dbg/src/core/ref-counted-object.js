var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class RefCountedObject {
  constructor() {
    /** @private */
    __publicField(this, "_refCount", 0);
  }
  /**
   * Increments the reference counter.
   */
  incRefCount() {
    this._refCount++;
  }
  /**
   * Decrements the reference counter.
   */
  decRefCount() {
    this._refCount--;
  }
  /**
   * Gets the current reference count.
   *
   * @type {number}
   */
  get refCount() {
    return this._refCount;
  }
}
export {
  RefCountedObject
};
