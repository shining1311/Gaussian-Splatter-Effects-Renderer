var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function getTouchTargetCoords(touch) {
  let totalOffsetX = 0;
  let totalOffsetY = 0;
  let target = touch.target;
  while (!(target instanceof HTMLElement) && target) {
    target = target.parentNode;
  }
  while (target) {
    totalOffsetX += target.offsetLeft - target.scrollLeft;
    totalOffsetY += target.offsetTop - target.scrollTop;
    target = target.offsetParent;
  }
  return {
    x: touch.pageX - totalOffsetX,
    y: touch.pageY - totalOffsetY
  };
}
class Touch {
  /**
   * Create a new Touch object from the browser Touch.
   *
   * @param {globalThis.Touch} touch - The browser Touch object.
   */
  constructor(touch) {
    /**
     * The identifier of the touch.
     *
     * @type {number}
     */
    __publicField(this, "id");
    /**
     * The x coordinate relative to the element that the TouchDevice is attached to.
     *
     * @type {number}
     */
    __publicField(this, "x");
    /**
     * The y coordinate relative to the element that the TouchDevice is attached to.
     *
     * @type {number}
     */
    __publicField(this, "y");
    /**
     * The target DOM element of the touch event.
     *
     * @type {Element}
     */
    __publicField(this, "target");
    /**
     * The original browser Touch object.
     *
     * @type {globalThis.Touch}
     */
    __publicField(this, "touch");
    const coords = getTouchTargetCoords(touch);
    this.id = touch.identifier;
    this.x = coords.x;
    this.y = coords.y;
    this.target = touch.target;
    this.touch = touch;
  }
}
class TouchEvent {
  /**
   * Create a new TouchEvent instance. It is created from an existing browser event.
   *
   * @param {TouchDevice} device - The source device of the touch events.
   * @param {globalThis.TouchEvent} event - The original browser TouchEvent.
   */
  constructor(device, event) {
    /**
     * The target DOM element that the event was fired from.
     *
     * @type {Element}
     */
    __publicField(this, "element");
    /**
     * The original browser TouchEvent.
     *
     * @type {globalThis.TouchEvent}
     */
    __publicField(this, "event");
    /**
     * A list of all touches currently in contact with the device.
     *
     * @type {Touch[]}
     */
    __publicField(this, "touches", []);
    /**
     * A list of touches that have changed since the last event.
     *
     * @type {Touch[]}
     */
    __publicField(this, "changedTouches", []);
    this.element = event.target;
    this.event = event;
    this.touches = Array.from(event.touches).map((touch) => new Touch(touch));
    this.changedTouches = Array.from(event.changedTouches).map((touch) => new Touch(touch));
  }
  /**
   * Get an event from one of the touch lists by the id. It is useful to access touches by their
   * id so that you can be sure you are referencing the same touch.
   *
   * @param {number} id - The identifier of the touch.
   * @param {Touch[]} list - An array of touches to search.
   * @returns {Touch|null} The {@link Touch} object or null.
   */
  getTouchById(id, list) {
    return list.find((touch) => touch.id === id) || null;
  }
}
export {
  Touch,
  TouchEvent,
  getTouchTargetCoords
};
