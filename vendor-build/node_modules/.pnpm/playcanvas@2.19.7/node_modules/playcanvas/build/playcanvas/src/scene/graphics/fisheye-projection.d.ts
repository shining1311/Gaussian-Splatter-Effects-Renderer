/**
 * Helper that caches derived fisheye projection values from a normalized slider value, camera FOV,
 * and projection matrix. Each consumer (renderer, culling, future skydome) creates its own instance
 * and calls {@link update} when it needs current values. The instance only mutates its own cached
 * fields, with no external side effects.
 *
 * Uses the generalized fisheye model g(θ) = k·tan(θ/k), where k controls the projection
 * characteristic: k=1 is rectilinear perspective, lower k increases barrel distortion.
 *
 * @ignore
 */
export class FisheyeProjection {
    /**
     * Whether fisheye is active (t > 0).
     */
    enabled: boolean;
    /**
     * The fisheye k parameter controlling projection curvature.
     */
    k: number;
    /**
     * Precomputed 1/k to avoid per-splat division in shaders.
     */
    invK: number;
    /**
     * Scale factor blending from edge-fit (1.0) to corner-fit (sqrt(2)) based on t.
     */
    cornerScale: number;
    /**
     * Fisheye-adjusted horizontal projection scale for NDC conversion.
     */
    projMat00: number;
    /**
     * Fisheye-adjusted vertical projection scale for NDC conversion.
     */
    projMat11: number;
    /**
     * Maximum viewing angle before singularity, used for cone culling.
     */
    maxTheta: number;
    /** @private */
    private _lastT;
    /** @private */
    private _lastFov;
    /** @private */
    private _lastP00;
    /** @private */
    private _lastP11;
    /**
     * Recomputes all derived fisheye values. Short-circuits if inputs haven't changed.
     *
     * @param {number} t - Normalized fisheye slider value in [0, 1]. 0 = rectilinear, 1 = max distortion.
     * @param {number} fov - Camera vertical FOV in degrees.
     * @param {import('../../core/math/mat4.js').Mat4} projMatrix - The camera's projection matrix.
     */
    update(t: number, fov: number, projMatrix: import("../../core/math/mat4.js").Mat4): void;
}
