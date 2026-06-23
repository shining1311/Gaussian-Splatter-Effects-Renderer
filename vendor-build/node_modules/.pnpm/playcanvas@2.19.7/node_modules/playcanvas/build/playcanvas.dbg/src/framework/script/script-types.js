var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const _ScriptTypes = class _ScriptTypes {
  static push(Type) {
    _ScriptTypes._types.push(Type);
  }
};
__publicField(_ScriptTypes, "_types", []);
let ScriptTypes = _ScriptTypes;
export {
  ScriptTypes
};
