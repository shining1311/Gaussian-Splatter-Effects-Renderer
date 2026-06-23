var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../core/event-handler.js";
import { platform } from "../../core/platform.js";
import { UnifiedSortWorker } from "./gsplat-unified-sort-worker.js";
import { GSplatSortBinWeights } from "./gsplat-sort-bin-weights.js";
const _neededIds = /* @__PURE__ */ new Set();
class GSplatUnifiedSorter extends EventHandler {
  /**
   * @param {Scene} [scene] - The scene to fire sort timing events on.
   */
  constructor(scene) {
    super();
    __publicField(this, "worker");
    __publicField(this, "bufferLength", 0);
    __publicField(this, "availableOrderData", []);
    // track how many jobs are in flight
    __publicField(this, "jobsInFlight", 0);
    // true if we have new version to process
    __publicField(this, "hasNewVersion", false);
    /**
     * Pending sorted result to be applied next frame. If multiple sorted results are received from
     * the worker, the latest result is stored here.
     *
     * @type {{ count: number, version: number, orderData: Uint32Array }|null}
     */
    __publicField(this, "pendingSorted", null);
    /** @type {Set<number>} */
    __publicField(this, "centersSet", /* @__PURE__ */ new Set());
    /** @type {boolean} */
    __publicField(this, "_destroyed", false);
    /** @type {Scene|null} */
    __publicField(this, "scene", null);
    this.scene = scene ?? null;
    const workerSource = `
            const GSplatSortBinWeights = ${GSplatSortBinWeights.toString()};
            (${UnifiedSortWorker.toString()})()
        `;
    if (platform.environment === "node") {
      this.worker = new Worker(workerSource, {
        eval: true
      });
      this.worker.on("message", this.onSorted.bind(this));
    } else {
      this.worker = new Worker(URL.createObjectURL(new Blob([workerSource], {
        type: "application/javascript"
      })));
      this.worker.addEventListener("message", this.onSorted.bind(this));
    }
  }
  onSorted(message) {
    if (this._destroyed) {
      return;
    }
    const msgData = message.data ?? message;
    if (this.scene && msgData.sortTime !== void 0) {
      this.scene.fire("gsplat:sorted", msgData.sortTime);
    }
    const orderData = new Uint32Array(msgData.order);
    this.jobsInFlight--;
    if (this.pendingSorted) {
      this.releaseOrderData(this.pendingSorted.orderData);
    }
    this.pendingSorted = {
      count: msgData.count,
      version: msgData.version,
      orderData
    };
  }
  applyPendingSorted() {
    if (this.pendingSorted) {
      const { count, version, orderData } = this.pendingSorted;
      this.pendingSorted = null;
      this.fire("sorted", count, version, orderData);
      this.releaseOrderData(orderData);
    }
  }
  releaseOrderData(orderData) {
    if (orderData.length === this.bufferLength) {
      this.availableOrderData.push(orderData);
    }
  }
  destroy() {
    this._destroyed = true;
    this.pendingSorted = null;
    this.worker.terminate();
    this.worker = null;
  }
  /**
   * Adds or removes centers from the sorter.
   *
   * @param {number} id - The id of the centers.
   * @param {Float32Array|null} centers - The centers buffer.
   */
  setCenters(id, centers) {
    if (centers) {
      if (!this.centersSet.has(id)) {
        this.centersSet.add(id);
        const centersBuffer = centers.buffer.slice();
        this.worker.postMessage({
          command: "addCenters",
          id,
          centers: centersBuffer
        }, [centersBuffer]);
      }
    } else {
      if (this.centersSet.has(id)) {
        this.centersSet.delete(id);
        this.worker.postMessage({
          command: "removeCenters",
          id
        });
      }
    }
  }
  /**
   * Updates centers in the worker based on current splats.
   * Adds new centers and removes centers no longer needed.
   *
   * @param {GSplatInfo[]} splats - Array of active splat infos.
   */
  updateCentersForSplats(splats) {
    for (const splat of splats) {
      const id = splat.resource.id;
      _neededIds.add(id);
      if (!this.centersSet.has(id)) {
        this.setCenters(id, splat.resource.centers);
      }
    }
    for (const id of this.centersSet) {
      if (!_neededIds.has(id)) {
        this.setCenters(id, null);
      }
    }
    _neededIds.clear();
  }
  /**
   * Sets sort parameters data for sorting of splats.
   *
   * @param {object} payload - The sort parameters payload to send.
   */
  setSortParameters(payload) {
    this.hasNewVersion = true;
    const { textureSize } = payload;
    const newLength = textureSize * textureSize;
    if (newLength !== this.bufferLength) {
      this.bufferLength = newLength;
      this.availableOrderData.length = 0;
    }
    this.worker.postMessage(payload);
  }
  /**
   * Sends sorting parameters to the sorter. Called every frame sorting is needed.
   *
   * @param {object} params - The sorting parameters - per-splat directions, offsets, scales, AABBs.
   * @param {boolean} radialSorting - Whether to use radial distance sorting.
   */
  setSortParams(params, radialSorting) {
    if (this.hasNewVersion || this.jobsInFlight === 0) {
      let orderData = this.availableOrderData.pop();
      if (!orderData) {
        orderData = new Uint32Array(this.bufferLength);
      }
      this.jobsInFlight++;
      this.hasNewVersion = false;
      this.worker.postMessage({
        command: "sort",
        sortParams: params,
        radialSorting,
        order: orderData.buffer
      }, [
        orderData.buffer
      ]);
    }
  }
}
export {
  GSplatUnifiedSorter
};
