var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class SceneRegistryItem {
  /**
   * Creates a new SceneRegistryItem instance.
   *
   * @param {string} name - The name of the scene.
   * @param {string} url - The url of the scene file.
   */
  constructor(name, url) {
    /**
     * The name of the scene.
     *
     * @type {string}
     */
    __publicField(this, "name");
    /**
     * The url of the scene file.
     *
     * @type {string}
     */
    __publicField(this, "url");
    /** @ignore */
    __publicField(this, "data", null);
    /** @private */
    __publicField(this, "_loading", false);
    /** @private */
    __publicField(this, "_onLoadedCallbacks", []);
    this.name = name;
    this.url = url;
  }
  /**
   * Returns true if the scene data has loaded.
   *
   * @type {boolean}
   */
  get loaded() {
    return !!this.data;
  }
  /**
   * Returns true if the scene data is still being loaded.
   *
   * @type {boolean}
   */
  get loading() {
    return this._loading;
  }
}
export {
  SceneRegistryItem
};
