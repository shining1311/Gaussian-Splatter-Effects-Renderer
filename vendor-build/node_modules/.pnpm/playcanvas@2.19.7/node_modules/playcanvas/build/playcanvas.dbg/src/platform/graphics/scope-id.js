import { VersionedObject } from "./versioned-object.js";
class ScopeId {
  /**
   * Create a new ScopeId instance.
   *
   * @param {string} name - The variable name.
   */
  constructor(name) {
    this.name = name;
    this.value = null;
    this.versionObject = new VersionedObject();
  }
  // Don't stringify ScopeId to JSON by JSON.stringify, as this stores 'value'
  // which is not needed. This is used when stringifying a uniform buffer format, which
  // internally stores the scope.
  toJSON(key) {
    return void 0;
  }
  /**
   * Set variable value.
   *
   * @param {*} value - The value.
   */
  setValue(value) {
    this.value = value;
    this.versionObject.increment();
  }
  /**
   * Get variable value.
   *
   * @returns {*} The value.
   */
  getValue() {
    return this.value;
  }
}
export {
  ScopeId
};
