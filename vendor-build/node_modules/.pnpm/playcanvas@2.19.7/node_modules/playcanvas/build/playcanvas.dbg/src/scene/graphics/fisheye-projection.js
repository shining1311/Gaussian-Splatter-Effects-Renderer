var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class FisheyeProjection {
  constructor() {
    /**
     * Whether fisheye is active (t > 0).
     */
    __publicField(this, "enabled", false);
    /**
     * The fisheye k parameter controlling projection curvature.
     */
    __publicField(this, "k", 1);
    /**
     * Precomputed 1/k to avoid per-splat division in shaders.
     */
    __publicField(this, "invK", 1);
    /**
     * Scale factor blending from edge-fit (1.0) to corner-fit (sqrt(2)) based on t.
     */
    __publicField(this, "cornerScale", 1);
    /**
     * Fisheye-adjusted horizontal projection scale for NDC conversion.
     */
    __publicField(this, "projMat00", 1);
    /**
     * Fisheye-adjusted vertical projection scale for NDC conversion.
     */
    __publicField(this, "projMat11", 1);
    /**
     * Maximum viewing angle before singularity, used for cone culling.
     */
    __publicField(this, "maxTheta", Math.PI);
    // Cached inputs for short-circuit check
    /** @private */
    __publicField(this, "_lastT", -1);
    /** @private */
    __publicField(this, "_lastFov", -1);
    /** @private */
    __publicField(this, "_lastP00", 0);
    /** @private */
    __publicField(this, "_lastP11", 0);
  }
  /**
   * Recomputes all derived fisheye values. Short-circuits if inputs haven't changed.
   *
   * @param {number} t - Normalized fisheye slider value in [0, 1]. 0 = rectilinear, 1 = max distortion.
   * @param {number} fov - Camera vertical FOV in degrees.
   * @param {import('../../core/math/mat4.js').Mat4} projMatrix - The camera's projection matrix.
   */
  update(t, fov, projMatrix) {
    if (projMatrix.data[15] === 1) {
      t = 0;
    }
    const p00 = projMatrix.data[0];
    const p11 = projMatrix.data[5];
    if (t === this._lastT && fov === this._lastFov && p00 === this._lastP00 && p11 === this._lastP11) {
      return;
    }
    this._lastT = t;
    this._lastFov = fov;
    this._lastP00 = p00;
    this._lastP11 = p11;
    if (t <= 0) {
      this.enabled = false;
      this.k = 1;
      this.invK = 1;
      this.cornerScale = 1;
      this.maxTheta = Math.PI;
      return;
    }
    this.enabled = true;
    const kMin = fov / 180 + 0.15;
    const kStart = Math.max(1, fov / 180 + 0.05);
    const k = kStart * Math.pow(kMin / kStart, t);
    this.k = k;
    this.invK = 1 / k;
    this.cornerScale = 1 + (Math.SQRT2 - 1) * t;
    const maxTheta = Math.min(k * Math.PI / 2, 3.13);
    const cs = this.cornerScale;
    const halfFovX = Math.atan2(1, p00);
    const effHalfFovX = Math.min(halfFovX, maxTheta - 0.01);
    this.projMat00 = cs / (k * Math.tan(effHalfFovX / k));
    const halfFovY = Math.atan2(1, p11);
    const effHalfFovY = Math.min(halfFovY, maxTheta - 0.01);
    this.projMat11 = cs / (k * Math.tan(effHalfFovY / k));
    this.maxTheta = maxTheta;
  }
}
export {
  FisheyeProjection
};
