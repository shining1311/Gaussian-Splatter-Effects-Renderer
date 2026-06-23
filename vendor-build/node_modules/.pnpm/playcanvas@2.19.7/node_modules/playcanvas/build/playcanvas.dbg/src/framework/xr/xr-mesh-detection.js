var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { platform } from "../../core/platform.js";
import { EventHandler } from "../../core/event-handler.js";
import { XrMesh } from "./xr-mesh.js";
class XrMeshDetection extends EventHandler {
  /**
   * Create a new XrMeshDetection instance.
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
    __publicField(this, "_supported", platform.browser && !!window.XRMesh);
    /** @private */
    __publicField(this, "_available", false);
    /**
     * @type {Map<XRMesh, XrMesh>}
     * @private
     */
    __publicField(this, "_index", /* @__PURE__ */ new Map());
    /**
     * @type {XrMesh[]}
     * @private
     */
    __publicField(this, "_list", []);
    this._manager = manager;
    if (this._supported) {
      this._manager.on("start", this._onSessionStart, this);
      this._manager.on("end", this._onSessionEnd, this);
    }
  }
  /**
   * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
   * @ignore
   */
  update(frame) {
    if (!this._available) {
      if (!this._manager.session.enabledFeatures && frame.detectedMeshes.size) {
        this._available = true;
        this.fire("available");
      } else {
        return;
      }
    }
    for (const xrMesh of frame.detectedMeshes) {
      let mesh = this._index.get(xrMesh);
      if (!mesh) {
        mesh = new XrMesh(this, xrMesh);
        this._index.set(xrMesh, mesh);
        this._list.push(mesh);
        mesh.update(frame);
        this.fire("add", mesh);
      } else {
        mesh.update(frame);
      }
    }
    for (const mesh of this._index.values()) {
      if (frame.detectedMeshes.has(mesh.xrMesh)) {
        continue;
      }
      this._removeMesh(mesh);
    }
  }
  /**
   * @param {XrMesh} mesh - XrMesh to remove.
   * @private
   */
  _removeMesh(mesh) {
    this._index.delete(mesh.xrMesh);
    this._list.splice(this._list.indexOf(mesh), 1);
    mesh.destroy();
    this.fire("remove", mesh);
  }
  /** @private */
  _onSessionStart() {
    if (this._manager.session.enabledFeatures) {
      const available = this._manager.session.enabledFeatures.indexOf("mesh-detection") !== -1;
      if (!available) return;
      this._available = available;
      this.fire("available");
    }
  }
  /** @private */
  _onSessionEnd() {
    if (!this._available) return;
    this._available = false;
    for (const mesh of this._index.values()) {
      this._removeMesh(mesh);
    }
    this.fire("unavailable");
  }
  /**
   * True if Mesh Detection is supported.
   *
   * @type {boolean}
   */
  get supported() {
    return this._supported;
  }
  /**
   * True if Mesh Detection is available. This information is available only when session has started.
   *
   * @type {boolean}
   */
  get available() {
    return this._available;
  }
  /**
   * Array of {@link XrMesh} instances that contain transform, vertices and label information.
   *
   * @type {XrMesh[]}
   */
  get meshes() {
    return this._list;
  }
}
/**
 * Fired when mesh detection becomes available.
 *
 * @event
 * @example
 * app.xr.meshDetection.on('available', () => {
 *     console.log('Mesh detection is available');
 * });
 */
__publicField(XrMeshDetection, "EVENT_AVAILABLE", "available");
/**
 * Fired when mesh detection becomes unavailable.
 *
 * @event
 * @example
 * app.xr.meshDetection.on('unavailable', () => {
 *     console.log('Mesh detection is unavailable');
 * });
 */
__publicField(XrMeshDetection, "EVENT_UNAVAILABLE", "unavailable");
/**
 * Fired when new {@link XrMesh} is added to the list. The handler is passed the {@link XrMesh}
 * instance that has been added.
 *
 * @event
 * @example
 * app.xr.meshDetection.on('add', (mesh) => {
 *     // a new XrMesh has been added
 * });
 */
__publicField(XrMeshDetection, "EVENT_ADD", "add");
/**
 * Fired when a {@link XrMesh} is removed from the list. The handler is passed the
 * {@link XrMesh} instance that has been removed.
 *
 * @event
 * @example
 * app.xr.meshDetection.on('remove', (mesh) => {
 *     // XrMesh has been removed
 * });
 */
__publicField(XrMeshDetection, "EVENT_REMOVE", "remove");
export {
  XrMeshDetection
};
