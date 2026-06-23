var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { SceneParser } from "./parsers/scene.js";
class Template {
  /**
   * Create a new Template instance.
   *
   * @param {AppBase} app - The application.
   * @param {object} data - Asset data from the database.
   */
  constructor(app, data) {
    /**
     * @type {AppBase}
     * @private
     */
    __publicField(this, "_app");
    /** @private */
    __publicField(this, "_data");
    /**
     * @type {Entity|null}
     * @private
     */
    __publicField(this, "_templateRoot", null);
    this._app = app;
    this._data = data;
  }
  /**
   * Create an instance of this template.
   *
   * @returns {Entity} The root entity of the created instance.
   */
  instantiate() {
    if (!this._templateRoot) {
      this._parseTemplate();
    }
    return this._templateRoot.clone();
  }
  /** @private */
  _parseTemplate() {
    const parser = new SceneParser(this._app, true);
    this._templateRoot = parser.parse(this._data);
  }
  set data(value) {
    this._data = value;
    this._templateRoot = null;
  }
  get data() {
    return this._data;
  }
}
export {
  Template
};
