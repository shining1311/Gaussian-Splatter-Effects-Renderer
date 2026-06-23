var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class StringIds {
  constructor() {
    /** @type {Map<string, number>} */
    __publicField(this, "map", /* @__PURE__ */ new Map());
    /** @type {number} */
    __publicField(this, "id", 0);
  }
  /**
   * Get the id for the given name. If the name has not been seen before, it will be assigned a new
   * id.
   *
   * @param {string} name - The name to get the id for.
   * @returns {number} The id for the given name.
   */
  get(name) {
    let value = this.map.get(name);
    if (value === void 0) {
      value = this.id++;
      this.map.set(name, value);
    }
    return value;
  }
}
export {
  StringIds
};
