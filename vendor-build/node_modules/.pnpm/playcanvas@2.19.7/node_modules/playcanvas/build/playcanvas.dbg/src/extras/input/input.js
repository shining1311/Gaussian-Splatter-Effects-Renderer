var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../core/event-handler.js";
import { Pose } from "./pose.js";
class InputDelta {
  /**
   * @param {number | number[]} arg - The size of the delta or an array of initial values.
   */
  constructor(arg) {
    /**
     * @type {number[]}
     * @private
     */
    __publicField(this, "_value");
    if (Array.isArray(arg)) {
      this._value = arg.slice();
    } else {
      this._value = new Array(+arg).fill(0);
    }
  }
  /**
   * Adds another InputDelta instance to this one.
   *
   * @param {InputDelta} other - The other InputDelta instance to add.
   * @returns {InputDelta} Self for chaining.
   */
  add(other) {
    for (let i = 0; i < this._value.length; i++) {
      this._value[i] += other._value[i] || 0;
    }
    return this;
  }
  /**
   * Appends offsets to the current delta values.
   *
   * @param {number[]} offsets - The offsets.
   * @returns {InputDelta} Self for chaining.
   */
  append(offsets) {
    for (let i = 0; i < this._value.length; i++) {
      this._value[i] += offsets[i] || 0;
    }
    return this;
  }
  /**
   * Copies the values from another InputDelta instance to this one.
   *
   * @param {InputDelta} other - The other InputDelta instance to copy from.
   * @returns {InputDelta} Self for chaining.
   */
  copy(other) {
    for (let i = 0; i < this._value.length; i++) {
      this._value[i] = other._value[i] || 0;
    }
    return this;
  }
  /**
   * The magnitude of the delta, calculated as the square root of the sum of squares
   * of the values.
   *
   * @returns {number} - The magnitude of the delta.
   */
  length() {
    let sum = 0;
    for (const value of this._value) {
      sum += value * value;
    }
    return Math.sqrt(sum);
  }
  /**
   * Returns the current value of the delta and resets it to zero.
   *
   * @returns {number[]} - The current value of the delta.
   */
  read() {
    const value = this._value.slice();
    this._value.fill(0);
    return value;
  }
}
class InputFrame {
  /**
   * @param {T} data - The input frame data, where each key corresponds to an input delta.
   */
  constructor(data) {
    /**
     * @type {{ [K in keyof T]: InputDelta }}
     */
    __publicField(
      this,
      "deltas",
      /** @type {{ [K in keyof T]: InputDelta }} */
      {}
    );
    for (const name in data) {
      this.deltas[name] = new InputDelta(data[name]);
    }
  }
  /**
   * Returns the current frame state and resets the deltas to zero.
   *
   * @returns {{ [K in keyof T]: number[] }} - The flushed input frame with current deltas.
   */
  read() {
    const frame = (
      /** @type {{ [K in keyof T]: number[] }} */
      {}
    );
    for (const name in this.deltas) {
      frame[name] = this.deltas[name].read();
    }
    return frame;
  }
}
class InputSource extends InputFrame {
  constructor() {
    super(...arguments);
    /**
     * @type {HTMLElement | null}
     * @protected
     */
    __publicField(this, "_element", null);
    /**
     * @type {EventHandler}
     * @private
     */
    __publicField(this, "_events", new EventHandler());
  }
  /**
   * Adds an event listener for the specified event.
   *
   * @param {string} event - The event name to listen for.
   * @param {HandleEventCallback} callback - The callback function to execute when the event is
   * triggered.
   */
  on(event, callback) {
    this._events.on(event, callback);
  }
  /**
   * Removes an event listener for the specified event.
   *
   * @param {string} event - The event name to stop listening for.
   * @param {HandleEventCallback} callback - The callback function to remove.
   */
  off(event, callback) {
    this._events.off(event, callback);
  }
  /**
   * Fires an event with the given name and arguments.
   *
   * @param {string} event - The event name to fire.
   * @param {...any} args - The arguments to pass to the event listeners.
   */
  fire(event, ...args) {
    this._events.fire(event, ...args);
  }
  /**
   * @param {HTMLElement} element - The element.
   */
  attach(element) {
    if (this._element) {
      this.detach();
    }
    this._element = element;
  }
  detach() {
    if (!this._element) {
      return;
    }
    this._element = null;
    this.read();
  }
  destroy() {
    this.detach();
    this._events.off();
  }
}
class InputConsumer {
  /**
   * @param {InputFrame} frame - The input frame.
   * @param {number} dt - The delta time.
   */
  update(frame, dt) {
    frame.read();
  }
}
class InputController extends InputConsumer {
  constructor() {
    super(...arguments);
    /**
     * @type {Pose}
     * @protected
     */
    __publicField(this, "_pose", new Pose());
  }
  /**
   * @param {Pose} pose - The initial pose of the controller.
   * @param {boolean} [smooth] - Whether to smooth the transition.
   */
  attach(pose, smooth = true) {
  }
  detach() {
  }
  /**
   * @param {InputFrame} frame - The input frame.
   * @param {number} dt - The delta time.
   * @returns {Pose} - The controller pose.
   * @override
   */
  update(frame, dt) {
    super.update(frame, dt);
    return this._pose;
  }
  destroy() {
    this.detach();
  }
}
export {
  InputConsumer,
  InputController,
  InputDelta,
  InputFrame,
  InputSource
};
