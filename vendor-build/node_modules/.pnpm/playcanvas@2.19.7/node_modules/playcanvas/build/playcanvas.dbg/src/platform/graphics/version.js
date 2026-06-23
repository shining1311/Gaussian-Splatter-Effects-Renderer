var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class Version {
  constructor() {
    __publicField(this, "globalId", 0);
    __publicField(this, "revision", 0);
  }
  equals(other) {
    return this.globalId === other.globalId && this.revision === other.revision;
  }
  copy(other) {
    this.globalId = other.globalId;
    this.revision = other.revision;
  }
  reset() {
    this.globalId = 0;
    this.revision = 0;
  }
}
export {
  Version
};
