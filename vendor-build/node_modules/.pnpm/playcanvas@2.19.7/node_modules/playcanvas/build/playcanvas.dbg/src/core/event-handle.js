var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../core/debug.js";
class EventHandle {
  /**
   * @param {EventHandler} handler - source object of the event.
   * @param {string} name - Name of the event.
   * @param {HandleEventCallback} callback - Function that is called when event is fired.
   * @param {object} scope - Object that is used as `this` when event is fired.
   * @param {boolean} [once] - If this is a single event and will be removed after event is fired.
   */
  constructor(handler, name, callback, scope, once = false) {
    /**
     * @type {EventHandler}
     * @private
     */
    __publicField(this, "handler");
    /**
     * @type {string}
     * @ignore
     */
    __publicField(this, "name");
    /**
     * @type {HandleEventCallback}
     * @ignore
     */
    __publicField(this, "callback");
    /**
     * @type {object}
     * @ignore
     */
    __publicField(this, "scope");
    /**
     * @type {boolean}
     * @ignore
     */
    __publicField(this, "_once");
    /**
     * True if event has been removed.
     *
     * @private
     */
    __publicField(this, "_removed", false);
    this.handler = handler;
    this.name = name;
    this.callback = callback;
    this.scope = scope;
    this._once = once;
  }
  /**
   * Remove this event from its handler.
   */
  off() {
    if (this._removed) return;
    this.handler.offByHandle(this);
  }
  on(name, callback, scope = this) {
    Debug.deprecated("Using chaining with EventHandler.on is deprecated, subscribe to an event from EventHandler directly instead.");
    return this.handler._addCallback(name, callback, scope, false);
  }
  once(name, callback, scope = this) {
    Debug.deprecated("Using chaining with EventHandler.once is deprecated, subscribe to an event from EventHandler directly instead.");
    return this.handler._addCallback(name, callback, scope, true);
  }
  /**
   * Mark if event has been removed.
   *
   * @type {boolean}
   * @ignore
   */
  set removed(value) {
    if (!value) return;
    this._removed = true;
  }
  /**
   * True if event has been removed.
   *
   * @type {boolean}
   * @ignore
   */
  get removed() {
    return this._removed;
  }
  // don't stringify EventHandle to JSON by JSON.stringify
  toJSON(key) {
    return void 0;
  }
}
export {
  EventHandle
};
