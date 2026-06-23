var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { platform } from "../../core/platform.js";
import { EventHandler } from "../../core/event-handler.js";
import { XrPlane } from "./xr-plane.js";
class XrPlaneDetection extends EventHandler {
  /**
   * Create a new XrPlaneDetection instance.
   *
   * @param {XrManager} manager - WebXR Manager.
   * @ignore
   */
  constructor(manager) {
    super();
    /**
     * @type {XrManager}
     * @private
     */
    __publicField(this, "_manager");
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_supported", platform.browser && !!window.XRPlane);
    /** @private */
    __publicField(this, "_available", false);
    /**
     * @type {Map<XRPlane, XrPlane>}
     * @private
     */
    __publicField(this, "_planesIndex", /* @__PURE__ */ new Map());
    /**
     * @type {XrPlane[]}
     * @private
     */
    __publicField(this, "_planes", []);
    this._manager = manager;
    if (this._supported) {
      this._manager.on("start", this._onSessionStart, this);
      this._manager.on("end", this._onSessionEnd, this);
    }
  }
  /** @private */
  _onSessionStart() {
    if (this._manager.session.enabledFeatures) {
      const available = this._manager.session.enabledFeatures.indexOf("plane-detection") !== -1;
      if (available) {
        this._available = true;
        this.fire("available");
      }
    }
  }
  /** @private */
  _onSessionEnd() {
    for (let i = 0; i < this._planes.length; i++) {
      this._planes[i].destroy();
      this.fire("remove", this._planes[i]);
    }
    this._planesIndex.clear();
    this._planes.length = 0;
    if (this._available) {
      this._available = false;
      this.fire("unavailable");
    }
  }
  /**
   * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
   * @ignore
   */
  update(frame) {
    if (!this._available) {
      if (!this._manager.session.enabledFeatures && frame.detectedPlanes.size) {
        this._available = true;
        this.fire("available");
      } else {
        return;
      }
    }
    const detectedPlanes = frame.detectedPlanes;
    for (const [xrPlane, plane] of this._planesIndex) {
      if (detectedPlanes.has(xrPlane)) {
        continue;
      }
      this._planesIndex.delete(xrPlane);
      this._planes.splice(this._planes.indexOf(plane), 1);
      plane.destroy();
      this.fire("remove", plane);
    }
    for (const xrPlane of detectedPlanes) {
      let plane = this._planesIndex.get(xrPlane);
      if (!plane) {
        plane = new XrPlane(this, xrPlane);
        this._planesIndex.set(xrPlane, plane);
        this._planes.push(plane);
        plane.update(frame);
        this.fire("add", plane);
      } else {
        plane.update(frame);
      }
    }
  }
  /**
   * True if Plane Detection is supported.
   *
   * @type {boolean}
   */
  get supported() {
    return this._supported;
  }
  /**
   * True if Plane Detection is available. This information is available only when the session has started.
   *
   * @type {boolean}
   */
  get available() {
    return this._available;
  }
  /**
   * Array of {@link XrPlane} instances that contain individual plane information.
   *
   * @type {XrPlane[]}
   */
  get planes() {
    return this._planes;
  }
}
/**
 * Fired when plane detection becomes available.
 *
 * @event
 * @example
 * app.xr.planeDetection.on('available', () => {
 *     console.log('Plane detection is available');
 * });
 */
__publicField(XrPlaneDetection, "EVENT_AVAILABLE", "available");
/**
 * Fired when plane detection becomes unavailable.
 *
 * @event
 * @example
 * app.xr.planeDetection.on('unavailable', () => {
 *     console.log('Plane detection is unavailable');
 * });
 */
__publicField(XrPlaneDetection, "EVENT_UNAVAILABLE", "unavailable");
/**
 * Fired when new {@link XrPlane} is added to the list. The handler is passed the
 * {@link XrPlane} instance that has been added.
 *
 * @event
 * @example
 * app.xr.planeDetection.on('add', (plane) => {
 *     // new plane is added
 * });
 */
__publicField(XrPlaneDetection, "EVENT_ADD", "add");
/**
 * Fired when a {@link XrPlane} is removed from the list. The handler is passed the
 * {@link XrPlane} instance that has been removed.
 *
 * @event
 * @example
 * app.xr.planeDetection.on('remove', (plane) => {
 *     // new plane is removed
 * });
 */
__publicField(XrPlaneDetection, "EVENT_REMOVE", "remove");
export {
  XrPlaneDetection
};
