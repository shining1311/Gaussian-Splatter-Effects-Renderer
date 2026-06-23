var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class WebglDrawCommands {
  /**
   * @param {number} indexSizeBytes - Size of index in bytes (1, 2 or 4). 0 for non-indexed.
   */
  constructor(indexSizeBytes) {
    /** @type {number} */
    __publicField(this, "indexSizeBytes");
    /** @type {Int32Array|null} */
    __publicField(this, "glCounts", null);
    /** @type {Int32Array|null} */
    __publicField(this, "glOffsetsBytes", null);
    /** @type {Int32Array|null} */
    __publicField(this, "glInstanceCounts", null);
    this.indexSizeBytes = indexSizeBytes;
  }
  /**
   * Allocate SoA arrays for multi-draw.
   * @param {number} maxCount - Number of sub-draws.
   */
  allocate(maxCount) {
    if (this.glCounts && this.glCounts.length === maxCount) {
      return;
    }
    this.glCounts = new Int32Array(maxCount);
    this.glOffsetsBytes = new Int32Array(maxCount);
    this.glInstanceCounts = new Int32Array(maxCount);
  }
  /**
   * Write a single draw entry.
   * @param {number} i - Draw index.
   * @param {number} indexOrVertexCount - Count of indices/vertices.
   * @param {number} instanceCount - Instance count.
   * @param {number} firstIndexOrVertex - First index/vertex.
   */
  add(i, indexOrVertexCount, instanceCount, firstIndexOrVertex) {
    this.glCounts[i] = indexOrVertexCount;
    this.glOffsetsBytes[i] = firstIndexOrVertex * this.indexSizeBytes;
    this.glInstanceCounts[i] = instanceCount;
  }
  /**
   * Calculate total primitives for stats (profiler builds only).
   * @param {number} count - Number of active draws.
   * @returns {number} Total primitive count.
   */
  update(count) {
    let totalPrimitives = 0;
    if (this.glCounts && this.glInstanceCounts && count > 0) {
      for (let d = 0; d < count; d++) {
        const indexOrVertexCount = this.glCounts[d];
        const instanceCount = this.glInstanceCounts[d];
        totalPrimitives += indexOrVertexCount * instanceCount;
      }
    }
    return totalPrimitives;
  }
}
export {
  WebglDrawCommands
};
