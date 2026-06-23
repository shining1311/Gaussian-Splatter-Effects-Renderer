var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../core/event-handler.js";
import { TouchEvent } from "./touch-event.js";
class TouchDevice extends EventHandler {
  /**
   * Create a new touch device and attach it to an element.
   *
   * @param {Element} element - The element to attach listen for events on.
   */
  constructor(element) {
    super();
    /**
     * @type {Element|null}
     * @private
     */
    __publicField(this, "_element", null);
    /**
     * @type {(e: globalThis.TouchEvent) => void}
     * @private
     */
    __publicField(this, "_startHandler");
    /**
     * @type {(e: globalThis.TouchEvent) => void}
     * @private
     */
    __publicField(this, "_endHandler");
    /**
     * @type {(e: globalThis.TouchEvent) => void}
     * @private
     */
    __publicField(this, "_moveHandler");
    /**
     * @type {(e: globalThis.TouchEvent) => void}
     * @private
     */
    __publicField(this, "_cancelHandler");
    this._startHandler = this._handleTouchStart.bind(this);
    this._endHandler = this._handleTouchEnd.bind(this);
    this._moveHandler = this._handleTouchMove.bind(this);
    this._cancelHandler = this._handleTouchCancel.bind(this);
    this.attach(element);
  }
  /**
   * Attach a device to an element in the DOM. If the device is already attached to an element
   * this method will detach it first.
   *
   * @param {Element} element - The element to attach to.
   */
  attach(element) {
    if (this._element) {
      this.detach();
    }
    this._element = element;
    this._element.addEventListener("touchstart", this._startHandler, false);
    this._element.addEventListener("touchend", this._endHandler, false);
    this._element.addEventListener("touchmove", this._moveHandler, false);
    this._element.addEventListener("touchcancel", this._cancelHandler, false);
  }
  /**
   * Detach a device from the element it is attached to.
   */
  detach() {
    if (this._element) {
      this._element.removeEventListener("touchstart", this._startHandler, false);
      this._element.removeEventListener("touchend", this._endHandler, false);
      this._element.removeEventListener("touchmove", this._moveHandler, false);
      this._element.removeEventListener("touchcancel", this._cancelHandler, false);
    }
    this._element = null;
  }
  _handleTouchStart(e) {
    this.fire("touchstart", new TouchEvent(this, e));
  }
  _handleTouchEnd(e) {
    this.fire("touchend", new TouchEvent(this, e));
  }
  _handleTouchMove(e) {
    e.preventDefault();
    this.fire("touchmove", new TouchEvent(this, e));
  }
  _handleTouchCancel(e) {
    this.fire("touchcancel", new TouchEvent(this, e));
  }
}
/**
 * Fired when a touch starts. The handler is passed a {@link TouchEvent}.
 *
 * @event
 * @example
 * app.touch.on('touchstart', (e) => {
 *     console.log(`Touch started at position: ${e.x}, ${e.y}`);
 * });
 */
__publicField(TouchDevice, "EVENT_TOUCHSTART", "touchstart");
/**
 * Fired when a touch ends. The handler is passed a {@link TouchEvent}.
 *
 * @event
 * @example
 * app.touch.on('touchend', (e) => {
 *     console.log(`Touch ended at position: ${e.x}, ${e.y}`);
 * });
 */
__publicField(TouchDevice, "EVENT_TOUCHEND", "touchend");
/**
 * Fired when a touch moves. The handler is passed a {@link TouchEvent}.
 *
 * @event
 * @example
 * app.touch.on('touchmove', (e) => {
 *     console.log(`Touch moved to position: ${e.x}, ${e.y}`);
 * });
 */
__publicField(TouchDevice, "EVENT_TOUCHMOVE", "touchmove");
/**
 * Fired when a touch is interrupted in some way. The exact reasons for canceling a touch can
 * vary from device to device. For example, a modal alert pops up during the interaction; the
 * touch point leaves the document area, or there are more touch points than the device
 * supports, in which case the earliest touch point is canceled. The handler is passed a
 * {@link TouchEvent}.
 *
 * @event
 * @example
 * app.touch.on('touchcancel', (e) => {
 *     console.log(`Touch canceled at position: ${e.x}, ${e.y}`);
 * });
 */
__publicField(TouchDevice, "EVENT_TOUCHCANCEL", "touchcancel");
export {
  TouchDevice
};
