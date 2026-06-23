var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class NumericIds {
  constructor() {
    /** @type {number} */
    __publicField(this, "_counter", 0);
  }
  /**
   * Get the next unique ID.
   *
   * @returns {number} A unique sequential ID.
   */
  get() {
    return this._counter++;
  }
}
export {
  NumericIds
};
