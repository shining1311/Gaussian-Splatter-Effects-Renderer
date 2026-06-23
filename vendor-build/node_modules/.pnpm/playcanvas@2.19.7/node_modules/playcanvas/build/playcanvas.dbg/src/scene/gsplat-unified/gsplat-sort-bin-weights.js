class GSplatSortBinWeights {
  /**
   * Number of bins for camera-relative precision weighting.
   *
   * @type {number}
   */
  static get NUM_BINS() {
    return 32;
  }
  /**
   * Weight tiers for camera-relative precision (distance from camera bin -> weight multiplier).
   * Closer bins get more precision for better visual quality near the camera.
   *
   * @type {Array<{maxDistance: number, weight: number}>}
   */
  static get WEIGHT_TIERS() {
    return [
      { maxDistance: 0, weight: 40 },
      // Camera bin
      { maxDistance: 2, weight: 20 },
      // Adjacent bins
      { maxDistance: 5, weight: 8 },
      // Nearby bins
      { maxDistance: 10, weight: 3 },
      // Medium distance
      { maxDistance: Infinity, weight: 1 }
      // Far bins
    ];
  }
  /**
   * Creates a new GSplatSortBinWeights instance.
   *
   * All instance state is assigned here rather than via class field declarations.
   * This class is stringified into a Worker blob; with esbuild targeting es2020,
   * class fields are transpiled into __publicField() helper calls whose helper
   * isn't present in the worker scope, causing ReferenceError on construction.
   */
  constructor() {
    const numBins = GSplatSortBinWeights.NUM_BINS;
    const weightTiers = GSplatSortBinWeights.WEIGHT_TIERS;
    this.binWeights = new Float32Array(numBins * 2);
    this.bitsPerBin = new Float32Array(numBins);
    this.weightByDistance = new Float32Array(numBins);
    for (let dist = 0; dist < numBins; dist++) {
      let weight = 1;
      for (let j = 0; j < weightTiers.length; j++) {
        if (dist <= weightTiers[j].maxDistance) {
          weight = weightTiers[j].weight;
          break;
        }
      }
      this.weightByDistance[dist] = weight;
    }
    this.lastCameraBin = -1;
    this.lastBucketCount = -1;
  }
  /**
   * Computes the camera bin index based on sort mode and distance range.
   *
   * @param {boolean} radialSort - Whether using radial sort mode.
   * @param {number} minDist - Minimum distance.
   * @param {number} range - Distance range (maxDist - minDist).
   * @returns {number} The camera bin index (0 to NUM_BINS-1).
   */
  static computeCameraBin(radialSort, minDist, range) {
    const numBins = GSplatSortBinWeights.NUM_BINS;
    if (radialSort) {
      return numBins - 1;
    }
    const cameraOffsetFromRangeStart = -minDist;
    const cameraBinFloat = cameraOffsetFromRangeStart / range * numBins;
    return Math.max(0, Math.min(numBins - 1, Math.floor(cameraBinFloat)));
  }
  /**
   * Computes bin weights for the given camera bin and bucket count.
   * Results are cached - returns immediately if inputs haven't changed.
   *
   * @param {number} cameraBin - The bin index where the camera is located (0 to NUM_BINS-1).
   * @param {number} bucketCount - Total number of sorting buckets (typically 2^numBits).
   * @returns {Float32Array} The same binWeights array with computed values.
   */
  compute(cameraBin, bucketCount) {
    if (cameraBin === this.lastCameraBin && bucketCount === this.lastBucketCount) {
      return this.binWeights;
    }
    this.lastCameraBin = cameraBin;
    this.lastBucketCount = bucketCount;
    const numBins = GSplatSortBinWeights.NUM_BINS;
    const bitsPerBin = this.bitsPerBin;
    for (let i = 0; i < numBins; i++) {
      const distFromCamera = Math.abs(i - cameraBin);
      bitsPerBin[i] = this.weightByDistance[distFromCamera];
    }
    let totalWeight = 0;
    for (let i = 0; i < numBins; i++) {
      totalWeight += bitsPerBin[i];
    }
    let accumulated = 0;
    for (let i = 0; i < numBins; i++) {
      const divider = Math.max(1, Math.floor(bitsPerBin[i] / totalWeight * bucketCount));
      this.binWeights[i * 2] = accumulated;
      this.binWeights[i * 2 + 1] = divider;
      accumulated += divider;
    }
    if (accumulated > bucketCount) {
      const excess = accumulated - bucketCount;
      const lastDividerIdx = (numBins - 1) * 2 + 1;
      this.binWeights[lastDividerIdx] = Math.max(1, this.binWeights[lastDividerIdx] - excess);
    }
    return this.binWeights;
  }
}
export {
  GSplatSortBinWeights
};
