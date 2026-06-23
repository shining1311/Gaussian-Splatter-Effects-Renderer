var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { GpuProfiler } from "../gpu-profiler.js";
class FrameQueriesInfo {
  constructor() {
    /**
     * The render version of the frame.
     *
     * @type {number[]}
     */
    __publicField(this, "renderVersion");
    /**
     * The queries for the frame.
     *
     * @type {WebGLQuery[]}
     */
    __publicField(this, "queries", []);
  }
  destroy(gl) {
    this.queries.forEach((query) => gl.deleteQuery(query));
    this.queries = null;
  }
}
class WebglGpuProfiler extends GpuProfiler {
  constructor(device) {
    super();
    __publicField(this, "device");
    /**
     * The pool of unused queries.
     *
     * @type {WebGLQuery[]}
     */
    __publicField(this, "freeQueries", []);
    /**
     * The pool of queries for the current frame.
     *
     * @type {WebGLQuery[]}
     */
    __publicField(this, "frameQueries", []);
    /**
     * A list of queries from the previous frames which are waiting for results.
     *
     * @type {FrameQueriesInfo[]}
     */
    __publicField(this, "previousFrameQueries", []);
    /**
     * Temporary array to storing the timings.
     *
     * @type {number[]}
     */
    __publicField(this, "timings", []);
    this.device = device;
    this.ext = device.extDisjointTimerQuery;
  }
  destroy() {
    this.freeQueries.forEach((query) => this.device.gl.deleteQuery(query));
    this.frameQueries.forEach((query) => this.device.gl.deleteQuery(query));
    this.previousFrameQueries.forEach((frameQueriesInfo) => frameQueriesInfo.destroy(this.device.gl));
    this.freeQueries = null;
    this.frameQueries = null;
    this.previousFrameQueries = null;
  }
  /**
   * Called when the WebGL context was lost. It releases all context related resources.
   */
  loseContext() {
    super.loseContext();
    this.freeQueries = [];
    this.frameQueries = [];
    this.previousFrameQueries = [];
  }
  restoreContext() {
    this.ext = this.device.extDisjointTimerQuery;
  }
  getQuery() {
    return this.freeQueries.pop() ?? this.device.gl.createQuery();
  }
  start(name) {
    if (this.ext) {
      const slot = this.getSlot(name);
      const query = this.getQuery();
      this.frameQueries[slot] = query;
      this.device.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, query);
      return slot;
    }
    return void 0;
  }
  end(slot) {
    if (slot !== void 0) {
      this.device.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    }
  }
  frameStart() {
    this.processEnableRequest();
    if (this._enabled) {
      this.frameGPUMarkerSlot = this.start("GpuFrame");
    }
  }
  frameEnd() {
    if (this._enabled) {
      this.end(this.frameGPUMarkerSlot);
    }
  }
  request() {
    if (this._enabled) {
      const ext = this.ext;
      const gl = this.device.gl;
      const renderVersion = this.device.renderVersion;
      const frameQueries = this.frameQueries;
      if (frameQueries.length > 0) {
        this.frameQueries = [];
        const frameQueriesInfo = new FrameQueriesInfo();
        frameQueriesInfo.queries = frameQueries;
        frameQueriesInfo.renderVersion = renderVersion;
        this.previousFrameQueries.push(frameQueriesInfo);
      }
      if (this.previousFrameQueries.length > 0) {
        const previousQueriesInfo = this.previousFrameQueries[0];
        const previousQueries = previousQueriesInfo.queries;
        const lastQuery = previousQueries[previousQueries.length - 1];
        const available = gl.getQueryParameter(lastQuery, gl.QUERY_RESULT_AVAILABLE);
        const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
        if (available && !disjoint) {
          this.previousFrameQueries.shift();
          const timings = this.timings;
          timings.length = 0;
          for (let i = 0; i < previousQueries.length; i++) {
            const query = previousQueries[i];
            const duration = gl.getQueryParameter(query, gl.QUERY_RESULT);
            timings[i] = duration * 1e-6;
            this.freeQueries.push(query);
          }
          this.report(previousQueriesInfo.renderVersion, timings);
        }
        if (disjoint) {
          this.previousFrameQueries.forEach((frameQueriesInfo) => {
            this.report(frameQueriesInfo.renderVersion, null);
            frameQueriesInfo.destroy(gl);
          });
          this.previousFrameQueries.length = 0;
        }
      }
      super.request(renderVersion);
    }
  }
}
export {
  WebglGpuProfiler
};
