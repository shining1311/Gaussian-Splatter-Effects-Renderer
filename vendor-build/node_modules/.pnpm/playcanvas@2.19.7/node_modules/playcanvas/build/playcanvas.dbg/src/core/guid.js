const guid = {
  /**
   * Create an RFC4122 version 4 compliant GUID.
   *
   * @returns {string} A new GUID.
   */
  create() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
};
export {
  guid
};
