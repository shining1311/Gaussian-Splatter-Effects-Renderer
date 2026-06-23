var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Mat4 } from "../../core/math/mat4.js";
import { Vec3 } from "../../core/math/vec3.js";
class Listener {
  /**
   * Create a new listener instance.
   *
   * @param {SoundManager} manager - The sound manager.
   */
  constructor(manager) {
    /**
     * @type {SoundManager}
     * @private
     */
    __publicField(this, "_manager");
    /** @private */
    __publicField(this, "position", new Vec3());
    /** @private */
    __publicField(this, "orientation", new Mat4());
    this._manager = manager;
  }
  /**
   * Get the position of the listener.
   *
   * @returns {Vec3} The position of the listener.
   */
  getPosition() {
    return this.position;
  }
  /**
   * Set the position of the listener.
   *
   * @param {Vec3} position - The new position of the listener.
   */
  setPosition(position) {
    this.position.copy(position);
    const listener = this.listener;
    if (listener) {
      if ("positionX" in listener) {
        listener.positionX.value = position.x;
        listener.positionY.value = position.y;
        listener.positionZ.value = position.z;
      } else if (listener.setPosition) {
        listener.setPosition(position.x, position.y, position.z);
      }
    }
  }
  /**
   * Set the orientation matrix of the listener.
   *
   * @param {Mat4} orientation - The new orientation matrix of the listener.
   */
  setOrientation(orientation) {
    this.orientation.copy(orientation);
    const listener = this.listener;
    if (listener) {
      const m = orientation.data;
      if ("forwardX" in listener) {
        listener.forwardX.value = -m[8];
        listener.forwardY.value = -m[9];
        listener.forwardZ.value = -m[10];
        listener.upX.value = m[4];
        listener.upY.value = m[5];
        listener.upZ.value = m[6];
      } else if (listener.setOrientation) {
        listener.setOrientation(-m[8], -m[9], -m[10], m[4], m[5], m[6]);
      }
    }
  }
  /**
   * Get the orientation matrix of the listener.
   *
   * @returns {Mat4} The orientation matrix of the listener.
   */
  getOrientation() {
    return this.orientation;
  }
  /**
   * Get the listener.
   *
   * @type {AudioListener|null}
   */
  get listener() {
    const context = this._manager.context;
    return context ? context.listener : null;
  }
}
export {
  Listener
};
