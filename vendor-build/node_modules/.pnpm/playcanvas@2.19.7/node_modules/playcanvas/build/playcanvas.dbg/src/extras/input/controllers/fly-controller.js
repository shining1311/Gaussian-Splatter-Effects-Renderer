var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec3 } from "../../../core/math/vec3.js";
import { Quat } from "../../../core/math/quat.js";
import { InputController } from "../input.js";
import { Pose } from "../pose.js";
import { damp } from "../math.js";
const offset = new Vec3();
const angles = new Vec3();
const forward = new Vec3();
const right = new Vec3();
const up = new Vec3();
const rotation = new Quat();
class FlyController extends InputController {
  constructor() {
    super(...arguments);
    /**
     * @type {Pose}
     * @private
     */
    __publicField(this, "_targetPose", new Pose());
    /**
     * The rotation damping. In the range 0 to 1, where a value of 0 means no damping and 1 means
     * full damping. Default is 0.98.
     */
    __publicField(this, "rotateDamping", 0.98);
    /**
     * The movement damping. In the range 0 to 1, where a value of 0 means no damping and 1 means
     * full damping. Default is 0.98.
     */
    __publicField(this, "moveDamping", 0.98);
  }
  set pitchRange(value) {
    this._targetPose.pitchRange.copy(value);
    this._pose.copy(this._targetPose.rotate(Vec3.ZERO));
  }
  get pitchRange() {
    return this._targetPose.pitchRange;
  }
  set yawRange(value) {
    this._targetPose.yawRange.copy(value);
    this._pose.copy(this._targetPose.rotate(Vec3.ZERO));
  }
  get yawRange() {
    return this._targetPose.yawRange;
  }
  /**
   * @param {Pose} pose - The initial pose of the controller.
   * @param {boolean} [smooth] - Whether to smooth the transition.
   */
  attach(pose, smooth = true) {
    this._targetPose.copy(pose);
    if (!smooth) {
      this._pose.copy(this._targetPose);
    }
  }
  detach() {
    this._targetPose.copy(this._pose);
  }
  /**
   * @param {InputFrame<{ move: number[], rotate: number[] }>} frame - The input frame.
   * @param {number} dt - The delta time.
   * @returns {Pose} - The controller pose.
   */
  update(frame, dt) {
    const { move, rotate } = frame.read();
    this._targetPose.rotate(angles.set(-rotate[1], -rotate[0], 0));
    rotation.setFromEulerAngles(this._pose.angles);
    rotation.transformVector(Vec3.FORWARD, forward);
    rotation.transformVector(Vec3.RIGHT, right);
    rotation.transformVector(Vec3.UP, up);
    offset.set(0, 0, 0);
    offset.add(forward.mulScalar(move[2]));
    offset.add(right.mulScalar(move[0]));
    offset.add(up.mulScalar(move[1]));
    this._targetPose.move(offset);
    return this._pose.lerp(
      this._pose,
      this._targetPose,
      damp(this.moveDamping, dt),
      damp(this.rotateDamping, dt)
    );
  }
  destroy() {
    this.detach();
  }
}
export {
  FlyController
};
