var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../core/event-handler.js";
import { Color } from "../../core/math/color.js";
import { Mat4 } from "../../core/math/mat4.js";
import { Quat } from "../../core/math/quat.js";
import { Vec3 } from "../../core/math/vec3.js";
import { XRTYPE_AR } from "./constants.js";
const vec3A = new Vec3();
const vec3B = new Vec3();
const mat4A = new Mat4();
const mat4B = new Mat4();
class XrLightEstimation extends EventHandler {
  /**
   * Create a new XrLightEstimation instance.
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
    /** @private */
    __publicField(this, "_supported", false);
    /** @private */
    __publicField(this, "_available", false);
    /** @private */
    __publicField(this, "_lightProbeRequested", false);
    /**
     * @type {XRLightProbe|null}
     * @private
     */
    __publicField(this, "_lightProbe", null);
    /** @private */
    __publicField(this, "_intensity", 0);
    /** @private */
    __publicField(this, "_rotation", new Quat());
    /** @private */
    __publicField(this, "_color", new Color());
    /**
     * @type {Float32Array}
     * @private
     */
    __publicField(this, "_sphericalHarmonics", new Float32Array(27));
    this._manager = manager;
    this._manager.on("start", this._onSessionStart, this);
    this._manager.on("end", this._onSessionEnd, this);
  }
  /** @private */
  _onSessionStart() {
    const supported = !!this._manager.session.requestLightProbe;
    if (!supported) return;
    this._supported = true;
  }
  /** @private */
  _onSessionEnd() {
    this._supported = false;
    this._available = false;
    this._lightProbeRequested = false;
    this._lightProbe = null;
  }
  /**
   * Start estimation of illumination data. Availability of such data will come later and an
   * `available` event will be fired. If it failed to start estimation, an `error` event will be
   * fired.
   *
   * @example
   * app.xr.on('start', () => {
   *     if (app.xr.lightEstimation.supported) {
   *         app.xr.lightEstimation.start();
   *     }
   * });
   */
  start() {
    let err;
    if (!this._manager.session) {
      err = new Error("XR session is not running");
    }
    if (!err && this._manager.type !== XRTYPE_AR) {
      err = new Error("XR session type is not AR");
    }
    if (!err && !this._supported) {
      err = new Error("light-estimation is not supported");
    }
    if (!err && this._lightProbe || this._lightProbeRequested) {
      err = new Error("light estimation is already requested");
    }
    if (err) {
      this.fire("error", err);
      return;
    }
    this._lightProbeRequested = true;
    this._manager.session.requestLightProbe().then((lightProbe) => {
      const wasRequested = this._lightProbeRequested;
      this._lightProbeRequested = false;
      if (this._manager.active) {
        if (wasRequested) {
          this._lightProbe = lightProbe;
        }
      } else {
        this.fire("error", new Error("XR session is not active"));
      }
    }).catch((ex) => {
      this._lightProbeRequested = false;
      this.fire("error", ex);
    });
  }
  /**
   * End estimation of illumination data.
   */
  end() {
    this._lightProbeRequested = false;
    this._lightProbe = null;
    this._available = false;
  }
  /**
   * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
   * @ignore
   */
  update(frame) {
    if (!this._lightProbe) return;
    const lightEstimate = frame.getLightEstimate(this._lightProbe);
    if (!lightEstimate) return;
    if (!this._available) {
      this._available = true;
      this.fire("available");
    }
    const pli = lightEstimate.primaryLightIntensity;
    this._intensity = Math.max(1, Math.max(pli.x, Math.max(pli.y, pli.z)));
    vec3A.copy(pli).mulScalar(1 / this._intensity);
    this._color.set(vec3A.x, vec3A.y, vec3A.z);
    vec3A.set(0, 0, 0);
    vec3B.copy(lightEstimate.primaryLightDirection);
    mat4A.setLookAt(vec3B, vec3A, Vec3.UP);
    mat4B.setFromAxisAngle(Vec3.RIGHT, 90);
    mat4A.mul(mat4B);
    this._rotation.setFromMat4(mat4A);
    this._sphericalHarmonics.set(lightEstimate.sphericalHarmonicsCoefficients);
  }
  /**
   * True if Light Estimation is supported. This information is available only during an active AR
   * session.
   *
   * @type {boolean}
   */
  get supported() {
    return this._supported;
  }
  /**
   * True if estimated light information is available.
   *
   * @type {boolean}
   * @example
   * if (app.xr.lightEstimation.available) {
   *     entity.light.intensity = app.xr.lightEstimation.intensity;
   * }
   */
  get available() {
    return this._available;
  }
  /**
   * Intensity of what is estimated to be the most prominent directional light. Or null if data
   * is not available.
   *
   * @type {number|null}
   */
  get intensity() {
    return this._available ? this._intensity : null;
  }
  /**
   * Color of what is estimated to be the most prominent directional light. Or null if data is
   * not available.
   *
   * @type {Color|null}
   */
  get color() {
    return this._available ? this._color : null;
  }
  /**
   * Rotation of what is estimated to be the most prominent directional light. Or null if data is
   * not available.
   *
   * @type {Quat|null}
   */
  get rotation() {
    return this._available ? this._rotation : null;
  }
  /**
   * Spherical harmonic coefficients of estimated ambient light. Or null if data is not available.
   *
   * @type {Float32Array|null}
   */
  get sphericalHarmonics() {
    return this._available ? this._sphericalHarmonics : null;
  }
}
/**
 * Fired when light estimation data becomes available.
 *
 * @event
 * @example
 * app.xr.lightEstimation.on('available', () => {
 *     console.log('Light estimation is available');
 * });
 */
__publicField(XrLightEstimation, "EVENT_AVAILABLE", "available");
/**
 * Fired when light estimation has failed to start. The handler is passed the Error object
 * related to failure of light estimation start.
 *
 * @event
 * @example
 * app.xr.lightEstimation.on('error', (error) => {
 *     console.error(error.message);
 * });
 */
__publicField(XrLightEstimation, "EVENT_ERROR", "error");
export {
  XrLightEstimation
};
