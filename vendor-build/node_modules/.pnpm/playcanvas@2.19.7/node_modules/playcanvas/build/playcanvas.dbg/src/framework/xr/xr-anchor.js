var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../core/event-handler.js";
import { Vec3 } from "../../core/math/vec3.js";
import { Quat } from "../../core/math/quat.js";
class XrAnchor extends EventHandler {
  /**
   * @param {XrAnchors} anchors - Anchor manager.
   * @param {object} xrAnchor - Native XRAnchor object that is provided by WebXR API.
   * @param {string|null} uuid - ID string associated with a persistent anchor.
   * @ignore
   */
  constructor(anchors, xrAnchor, uuid = null) {
    super();
    /** @private */
    __publicField(this, "_position", new Vec3());
    /** @private */
    __publicField(this, "_rotation", new Quat());
    /**
     * @type {string|null}
     * @private
     */
    __publicField(this, "_uuid", null);
    /**
     * @type {XrAnchorPersistCallback[]|null}
     * @private
     */
    __publicField(this, "_uuidRequests", null);
    this._anchors = anchors;
    this._xrAnchor = xrAnchor;
    this._uuid = uuid;
  }
  /**
   * Destroy an anchor.
   */
  destroy() {
    if (!this._xrAnchor) return;
    const xrAnchor = this._xrAnchor;
    this._xrAnchor.delete();
    this._xrAnchor = null;
    this.fire("destroy", xrAnchor, this);
  }
  /**
   * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
   * @ignore
   */
  update(frame) {
    if (!this._xrAnchor) {
      return;
    }
    const pose = frame.getPose(this._xrAnchor.anchorSpace, this._anchors.manager._referenceSpace);
    if (pose) {
      if (this._position.equals(pose.transform.position) && this._rotation.equals(pose.transform.orientation)) {
        return;
      }
      this._position.copy(pose.transform.position);
      this._rotation.copy(pose.transform.orientation);
      this.fire("change");
    }
  }
  /**
   * Get the world space position of an anchor.
   *
   * @returns {Vec3} The world space position of an anchor.
   */
  getPosition() {
    return this._position;
  }
  /**
   * Get the world space rotation of an anchor.
   *
   * @returns {Quat} The world space rotation of an anchor.
   */
  getRotation() {
    return this._rotation;
  }
  /**
   * Persists the anchor between WebXR sessions by generating a universally unique identifier
   * (UUID) for the anchor. This UUID can be used later to restore the anchor from the underlying
   * system. Note that the underlying system may have a limit on the number of anchors that can
   * be persisted per origin.
   *
   * @param {XrAnchorPersistCallback} [callback] - Optional callback function to be called when
   * the persistent UUID has been generated or if an error occurs.
   * @example
   * // Persist the anchor and log the UUID or error
   * anchor.persist((err, uuid) => {
   *     if (err) {
   *         console.error('Failed to persist anchor:', err);
   *     } else {
   *         console.log('Anchor persisted with UUID:', uuid);
   *     }
   * });
   */
  persist(callback) {
    if (!this._anchors.persistence) {
      callback?.(new Error("Persistent Anchors are not supported"), null);
      return;
    }
    if (this._uuid) {
      callback?.(null, this._uuid);
      return;
    }
    if (this._uuidRequests) {
      if (callback) this._uuidRequests.push(callback);
      return;
    }
    this._uuidRequests = [];
    this._xrAnchor.requestPersistentHandle().then((uuid) => {
      this._uuid = uuid;
      this._anchors._indexByUuid.set(this._uuid, this);
      callback?.(null, uuid);
      for (const uuidRequest of this._uuidRequests) {
        uuidRequest(null, uuid);
      }
      this._uuidRequests = null;
      this.fire("persist", uuid);
    }).catch((ex) => {
      callback?.(ex, null);
      for (const uuidRequest of this._uuidRequests) {
        uuidRequest(ex, null);
      }
      this._uuidRequests = null;
    });
  }
  /**
   * Removes the persistent UUID of an anchor from the underlying system. This effectively makes
   * the anchor non-persistent, so it will not be restored in future WebXR sessions.
   *
   * @param {XrAnchorForgetCallback} [callback] - Optional callback function to be called when
   * the anchor has been forgotten or if an error occurs.
   * @example
   * // Forget the anchor and log the result or error
   * anchor.forget((err) => {
   *     if (err) {
   *         console.error('Failed to forget anchor:', err);
   *     } else {
   *         console.log('Anchor has been forgotten');
   *     }
   * });
   */
  forget(callback) {
    if (!this._uuid) {
      callback?.(new Error("Anchor is not persistent"));
      return;
    }
    this._anchors.forget(this._uuid, (ex) => {
      this._uuid = null;
      callback?.(ex);
      this.fire("forget");
    });
  }
  /**
   * Gets the UUID string of a persisted anchor or null if the anchor is not persisted.
   *
   * @type {null|string}
   */
  get uuid() {
    return this._uuid;
  }
  /**
   * Gets whether an anchor is persistent.
   *
   * @type {boolean}
   */
  get persistent() {
    return !!this._uuid;
  }
}
/**
 * Fired when an anchor is destroyed.
 *
 * @event
 * @example
 * // once anchor is destroyed
 * anchor.once('destroy', () => {
 *     // destroy its related entity
 *     entity.destroy();
 * });
 */
__publicField(XrAnchor, "EVENT_DESTROY", "destroy");
/**
 * Fired when an anchor's position and/or rotation is changed.
 *
 * @event
 * @example
 * anchor.on('change', () => {
 *     // anchor has been updated
 *     entity.setPosition(anchor.getPosition());
 *     entity.setRotation(anchor.getRotation());
 * });
 */
__publicField(XrAnchor, "EVENT_CHANGE", "change");
/**
 * Fired when an anchor has been persisted. The handler is passed the UUID string that can
 * be used to restore this anchor.
 *
 * @event
 * @example
 * anchor.on('persist', (uuid) => {
 *     // anchor has been persisted
 * });
 */
__publicField(XrAnchor, "EVENT_PERSIST", "persist");
/**
 * Fired when an anchor has been forgotten.
 *
 * @event
 * @example
 * anchor.on('forget', () => {
 *     // anchor has been forgotten
 * });
 */
__publicField(XrAnchor, "EVENT_FORGET", "forget");
export {
  XrAnchor
};
