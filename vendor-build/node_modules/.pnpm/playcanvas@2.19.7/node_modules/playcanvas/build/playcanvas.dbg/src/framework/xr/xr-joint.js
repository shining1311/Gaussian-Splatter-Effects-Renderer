var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { platform } from "../../core/platform.js";
import { Mat4 } from "../../core/math/mat4.js";
import { Quat } from "../../core/math/quat.js";
import { Vec3 } from "../../core/math/vec3.js";
const tipJointIds = platform.browser && window.XRHand ? [
  "thumb-tip",
  "index-finger-tip",
  "middle-finger-tip",
  "ring-finger-tip",
  "pinky-finger-tip"
] : [];
const tipJointIdsIndex = {};
for (let i = 0; i < tipJointIds.length; i++) {
  tipJointIdsIndex[tipJointIds[i]] = true;
}
class XrJoint {
  /**
   * Create an XrJoint instance.
   *
   * @param {number} index - Index of a joint within a finger.
   * @param {XRHandJoint} id - Id of a joint based on WebXR Hand Input Specs.
   * @param {XrHand} hand - Hand that joint relates to.
   * @param {XrFinger|null} finger - Finger that joint is related to. Can be null in the case of
   * the wrist joint.
   * @ignore
   */
  constructor(index, id, hand, finger = null) {
    /**
     * @type {number}
     * @private
     */
    __publicField(this, "_index");
    /**
     * @type {XRHandJoint}
     * @private
     */
    __publicField(this, "_id");
    /**
     * @type {XrHand}
     * @private
     */
    __publicField(this, "_hand");
    /**
     * @type {XrFinger|null}
     * @private
     */
    __publicField(this, "_finger");
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_wrist");
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_tip");
    /**
     * @type {number|null}
     * @private
     */
    __publicField(this, "_radius", null);
    /** @private */
    __publicField(this, "_localTransform", new Mat4());
    /** @private */
    __publicField(this, "_worldTransform", new Mat4());
    /** @private */
    __publicField(this, "_localPosition", new Vec3());
    /** @private */
    __publicField(this, "_localRotation", new Quat());
    /** @private */
    __publicField(this, "_position", new Vec3());
    /** @private */
    __publicField(this, "_rotation", new Quat());
    /** @private */
    __publicField(this, "_dirtyLocal", true);
    this._index = index;
    this._id = id;
    this._hand = hand;
    this._finger = finger;
    this._wrist = id === "wrist";
    this._tip = this._finger && !!tipJointIdsIndex[id];
  }
  /**
   * @param {XRJointPose} pose - XRJointPose of this joint.
   * @ignore
   */
  update(pose) {
    this._dirtyLocal = true;
    this._radius = pose.radius;
    this._localPosition.copy(pose.transform.position);
    this._localRotation.copy(pose.transform.orientation);
  }
  /** @private */
  _updateTransforms() {
    if (this._dirtyLocal) {
      this._dirtyLocal = false;
      this._localTransform.setTRS(this._localPosition, this._localRotation, Vec3.ONE);
    }
    const manager = this._hand._manager;
    const parent = manager.camera.parent;
    if (parent) {
      this._worldTransform.mul2(parent.getWorldTransform(), this._localTransform);
    } else {
      this._worldTransform.copy(this._localTransform);
    }
  }
  /**
   * Get the world space position of a joint.
   *
   * @returns {Vec3} The world space position of a joint.
   */
  getPosition() {
    this._updateTransforms();
    this._worldTransform.getTranslation(this._position);
    return this._position;
  }
  /**
   * Get the world space rotation of a joint.
   *
   * @returns {Quat} The world space rotation of a joint.
   */
  getRotation() {
    this._updateTransforms();
    this._rotation.setFromMat4(this._worldTransform);
    return this._rotation;
  }
  /**
   * Id of a joint based on WebXR Hand Input Specs.
   *
   * @type {XRHandJoint}
   */
  get id() {
    return this._id;
  }
  /**
   * Index of a joint within a finger, starting from 0 (root of a finger) all the way to tip of
   * the finger.
   *
   * @type {number}
   */
  get index() {
    return this._index;
  }
  /**
   * Hand that joint relates to.
   *
   * @type {XrHand}
   */
  get hand() {
    return this._hand;
  }
  /**
   * Finger that joint relates to.
   *
   * @type {XrFinger|null}
   */
  get finger() {
    return this._finger;
  }
  /**
   * True if joint is a wrist.
   *
   * @type {boolean}
   */
  get wrist() {
    return this._wrist;
  }
  /**
   * True if joint is a tip of a finger.
   *
   * @type {boolean}
   */
  get tip() {
    return this._tip;
  }
  /**
   * The radius of a joint, which is a distance from joint to the edge of a skin.
   *
   * @type {number}
   */
  get radius() {
    return this._radius || 5e-3;
  }
}
export {
  XrJoint
};
