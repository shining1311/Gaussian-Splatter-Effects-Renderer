import { ScopeId } from "./scope-id.js";
class ScopeSpace {
  /**
   * Create a new ScopeSpace instance.
   *
   * @param {string} name - The scope name.
   */
  constructor(name) {
    this.name = name;
    this.variables = /* @__PURE__ */ new Map();
  }
  /**
   * Get (or create, if it doesn't already exist) a variable in the scope.
   *
   * @param {string} name - The variable name.
   * @returns {ScopeId} The variable instance.
   */
  resolve(name) {
    if (!this.variables.has(name)) {
      this.variables.set(name, new ScopeId(name));
    }
    return this.variables.get(name);
  }
  /**
   * Clears value for any uniform with matching value (used to remove deleted textures).
   *
   * @param {*} value - The value to clear.
   * @ignore
   */
  removeValue(value) {
    for (const uniform of this.variables.values()) {
      if (uniform.value === value) {
        uniform.value = null;
      }
    }
  }
}
export {
  ScopeSpace
};
