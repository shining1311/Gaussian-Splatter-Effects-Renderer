class SetUtils {
  /**
   * Compares two sets for equality. Returns true if both sets have the same size and contain
   * the same elements.
   *
   * @param {Set} setA - First set to compare.
   * @param {Set} setB - Second set to compare.
   * @returns {boolean} True if sets are equal, false otherwise.
   */
  static equals(setA, setB) {
    if (setA.size !== setB.size) {
      return false;
    }
    for (const elem of setA) {
      if (!setB.has(elem)) {
        return false;
      }
    }
    return true;
  }
}
export {
  SetUtils
};
