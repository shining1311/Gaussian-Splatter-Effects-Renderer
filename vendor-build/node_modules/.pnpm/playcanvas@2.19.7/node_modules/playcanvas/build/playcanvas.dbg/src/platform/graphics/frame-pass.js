var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../core/debug.js";
import { Tracing } from "../../core/tracing.js";
import { TRACEID_RENDER_PASS } from "../../core/constants.js";
class FramePass {
  /**
   * Creates an instance of the FramePass.
   *
   * @param {GraphicsDevice} graphicsDevice - The graphics device.
   */
  constructor(graphicsDevice) {
    /** @type {string} */
    __publicField(this, "_name");
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    __publicField(this, "device");
    /**
     * True if the frame pass is enabled.
     *
     * @private
     */
    __publicField(this, "_enabled", true);
    /**
     * True if the render pass start is skipped. This means the render pass is merged into the
     * previous one. Used by FrameGraph.compile() for pass merging.
     *
     * @private
     */
    __publicField(this, "_skipStart", false);
    /**
     * True if the render pass end is skipped. This means the following render pass is merged into
     * this one. Used by FrameGraph.compile() for pass merging.
     *
     * @private
     */
    __publicField(this, "_skipEnd", false);
    /**
     * True if the frame pass is enabled and execute function will be called. Note that before and
     * after functions are called regardless of this flag.
     */
    __publicField(this, "executeEnabled", true);
    /**
     * If true, this pass might use dynamically rendered cubemaps. Defaults to false for non-render
     * passes (RenderPass overrides to true).
     */
    __publicField(this, "requiresCubemaps", false);
    /**
     * Frame passes which need to be executed before this pass.
     *
     * @type {FramePass[]}
     */
    __publicField(this, "beforePasses", []);
    /**
     * Frame passes which need to be executed after this pass.
     *
     * @type {FramePass[]}
     */
    __publicField(this, "afterPasses", []);
    Debug.assert(graphicsDevice);
    this.device = graphicsDevice;
  }
  set name(value) {
    this._name = value;
  }
  get name() {
    if (!this._name) {
      this._name = this.constructor.name;
    }
    return this._name;
  }
  set enabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;
      if (value) {
        this.onEnable();
      } else {
        this.onDisable();
      }
    }
  }
  get enabled() {
    return this._enabled;
  }
  onEnable() {
  }
  onDisable() {
  }
  frameUpdate() {
  }
  before() {
  }
  execute() {
  }
  after() {
  }
  destroy() {
  }
  render() {
    if (this.enabled) {
      Debug.call(() => {
        this.log(this.device, this.device.renderPassIndex);
      });
      this.before();
      if (this.executeEnabled) {
        this.execute();
      }
      this.after();
      this.device.renderPassIndex++;
    }
  }
  log(device, index = 0) {
    if (Tracing.get(TRACEID_RENDER_PASS)) {
      const indexString = index.toString().padEnd(2, " ");
      Debug.trace(
        TRACEID_RENDER_PASS,
        `${indexString}: ${this.name.padEnd(20, " ")}${this.executeEnabled ? "" : " DISABLED "}`
      );
    }
  }
}
export {
  FramePass
};
