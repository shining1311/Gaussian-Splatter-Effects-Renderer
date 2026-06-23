/**
 * A utility class for computing camera-relative bin weights used in GSplat sorting.
 * Pre-allocates a single interleaved Float32Array that is reused across frames.
 * Used by the hybrid projector compute shader and CPU worker sorting paths.
 *
 * This class is stringified and injected into the worker blob, so it must be
 * fully self-contained: no imports, and all constants as static properties.
 *
 * @ignore
 */
export class GSplatSortBinWeights {
    /**
     * Number of bins for camera-relative precision weighting.
     *
     * @type {number}
     */
    static get NUM_BINS(): number;
    /**
     * Weight tiers for camera-relative precision (distance from camera bin -> weight multiplier).
     * Closer bins get more precision for better visual quality near the camera.
     *
     * @type {Array<{maxDistance: number, weight: number}>}
     */
    static get WEIGHT_TIERS(): Array<{
        maxDistance: number;
        weight: number;
    }>;
    /**
     * Computes the camera bin index based on sort mode and distance range.
     *
     * @param {boolean} radialSort - Whether using radial sort mode.
     * @param {number} minDist - Minimum distance.
     * @param {number} range - Distance range (maxDist - minDist).
     * @returns {number} The camera bin index (0 to NUM_BINS-1).
     */
    static computeCameraBin(radialSort: boolean, minDist: number, range: number): number;
    /** @type {Float32Array} Interleaved [base0, divider0, base1, divider1, ...]. */
    binWeights: Float32Array;
    /** @type {Float32Array} Scratch array for bits per bin calculation. */
    bitsPerBin: Float32Array;
    /** @type {Float32Array} Weight lookup table by distance from camera. */
    weightByDistance: Float32Array;
    /** Cached cameraBin from last compute call. */
    lastCameraBin: number;
    /** Cached bucketCount from last compute call. */
    lastBucketCount: number;
    /**
     * Computes bin weights for the given camera bin and bucket count.
     * Results are cached - returns immediately if inputs haven't changed.
     *
     * @param {number} cameraBin - The bin index where the camera is located (0 to NUM_BINS-1).
     * @param {number} bucketCount - Total number of sorting buckets (typically 2^numBits).
     * @returns {Float32Array} The same binWeights array with computed values.
     */
    compute(cameraBin: number, bucketCount: number): Float32Array;
}
