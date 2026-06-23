var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class GSplatPlacementStateTracker {
  constructor() {
    /**
     * WeakMap of placement to last seen state.
     * Using WeakMap allows automatic cleanup when placements are garbage collected.
     *
     * @type {WeakMap<GSplatPlacement, { formatVersion: number, modifierHash: number, numSplats: number, centersVersion: number }>}
     * @private
     */
    __publicField(this, "_states", /* @__PURE__ */ new WeakMap());
  }
  /**
   * Checks if any placements have changed state. Updates internal tracking.
   *
   * @param {Iterable<GSplatPlacement>} placements - Iterable of placements to check.
   * @returns {boolean} True if any placement's state changed.
   */
  hasChanges(placements) {
    let changed = false;
    for (const p of placements) {
      if (!p.resource) continue;
      const formatVersion = p.resource.format?.extraStreamsVersion ?? 0;
      const modifierHash = p.workBufferModifier?.hash ?? 0;
      const numSplats = p.resource.numSplats ?? 0;
      const centersVersion = p.resource.centersVersion;
      const state = this._states.get(p);
      if (!state) {
        this._states.set(p, { formatVersion, modifierHash, numSplats, centersVersion });
        changed = true;
      } else if (state.formatVersion !== formatVersion || state.modifierHash !== modifierHash || state.numSplats !== numSplats || state.centersVersion !== centersVersion) {
        state.formatVersion = formatVersion;
        state.modifierHash = modifierHash;
        state.numSplats = numSplats;
        state.centersVersion = centersVersion;
        changed = true;
      }
    }
    return changed;
  }
}
export {
  GSplatPlacementStateTracker
};
