var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { platform } from "../../core/platform.js";
import { EventHandler } from "../../core/event-handler.js";
import { XrView } from "./xr-view.js";
import { XRTYPE_AR, XRDEPTHSENSINGUSAGE_GPU, XRDEPTHSENSINGFORMAT_L8A8, XRDEPTHSENSINGFORMAT_F32, XRDEPTHSENSINGFORMAT_R16U } from "./constants.js";
import { PIXELFORMAT_LA8, PIXELFORMAT_R32F, PIXELFORMAT_DEPTH } from "../../platform/graphics/constants.js";
class XrViews extends EventHandler {
  /**
   * Create a new XrViews instance.
   *
   * @param {XrManager} manager - WebXR Manager.
   * @ignore
   */
  constructor(manager) {
    super();
    /**
     * @type {XrManager}
     * @private
     */
    __publicField(this, "_manager");
    /**
     * @type {Map<string,XrView>}
     * @private
     */
    __publicField(this, "_index", /* @__PURE__ */ new Map());
    /**
     * @type {Map<string,XrView>}
     * @private
     */
    __publicField(this, "_indexTmp", /* @__PURE__ */ new Map());
    /**
     * @type {XrView[]}
     * @private
     */
    __publicField(this, "_list", []);
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_supportedColor", false);
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_supportedDepth", platform.browser && !!window.XRDepthInformation);
    /** @private */
    __publicField(this, "_availableColor", false);
    /** @private */
    __publicField(this, "_availableDepth", false);
    /** @private */
    __publicField(this, "_depthUsage", "");
    /** @private */
    __publicField(this, "_depthFormat", "");
    /**
     * @type {object}
     * @private
     */
    __publicField(this, "_depthFormats", {
      [XRDEPTHSENSINGFORMAT_L8A8]: PIXELFORMAT_LA8,
      [XRDEPTHSENSINGFORMAT_R16U]: PIXELFORMAT_DEPTH,
      [XRDEPTHSENSINGFORMAT_F32]: PIXELFORMAT_R32F
    });
    this._manager = manager;
    const gd = manager.app?.graphicsDevice;
    if (platform.browser && !!window.XRCamera) {
      if (gd?.isWebGL2 && !!window.XRWebGLBinding) {
        this._supportedColor = true;
      } else if (gd?.isWebGPU && !!window.XRGPUBinding) {
        this._supportedColor = true;
      }
    }
    this._manager.on("start", this._onSessionStart, this);
    this._manager.on("end", this._onSessionEnd, this);
  }
  /**
   * An array of {@link XrView}s of this session. Views are not available straight away on
   * session start, and can be added/removed mid-session. So use of `add`/`remove` events is
   * required for accessing views.
   *
   * @type {XrView[]}
   */
  get list() {
    return this._list;
  }
  /**
   * Check if Camera Color is supported. It might be still unavailable even if requested,
   * based on hardware capabilities and granted permissions.
   *
   * @type {boolean}
   */
  get supportedColor() {
    return this._supportedColor;
  }
  /**
   * Check if Camera Depth is supported. It might be still unavailable even if requested,
   * based on hardware capabilities and granted permissions.
   *
   * @type {boolean}
   */
  get supportedDepth() {
    return this._supportedDepth;
  }
  /**
   * Check if Camera Color is available. This information becomes available only after
   * session has started.
   *
   * @type {boolean}
   */
  get availableColor() {
    return this._availableColor;
  }
  /**
   * Check if Camera Depth is available. This information becomes available only after
   * session has started.
   *
   * @type {boolean}
   */
  get availableDepth() {
    return this._availableDepth;
  }
  /**
   * @type {string}
   * @ignore
   */
  get depthUsage() {
    return this._depthUsage;
  }
  /**
   * Whether the depth sensing is GPU optimized.
   *
   * @type {boolean}
   */
  get depthGpuOptimized() {
    return this._depthUsage === XRDEPTHSENSINGUSAGE_GPU;
  }
  /**
   * @type {string}
   * @ignore
   */
  get depthFormat() {
    return this._depthFormat;
  }
  /**
   * The depth sensing pixel format. Can be:
   *
   * - {@link PIXELFORMAT_LA8}
   * - {@link PIXELFORMAT_R32F}
   *
   * @type {PIXELFORMAT_LA8|PIXELFORMAT_R32F|null}
   */
  get depthPixelFormat() {
    return this._depthFormats[this._depthFormat] ?? null;
  }
  /**
   * @param {XRFrame} frame - XRFrame from requestAnimationFrame callback.
   * @param {XRView[]} xrViews - XRViews from the WebXR API.
   * @ignore
   */
  update(frame, xrViews) {
    for (let i = 0; i < xrViews.length; i++) {
      this._indexTmp.set(xrViews[i].eye, xrViews[i]);
    }
    for (const [eye, xrView] of this._indexTmp) {
      let view = this._index.get(eye);
      if (!view) {
        view = new XrView(this._manager, xrView, xrViews.length);
        this._index.set(eye, view);
        this._list.push(view);
        view.update(frame, xrView);
        this.fire("add", view);
      } else {
        view.update(frame, xrView);
      }
    }
    for (const [eye, view] of this._index) {
      if (this._indexTmp.has(eye)) {
        continue;
      }
      view.destroy();
      this._index.delete(eye);
      const ind = this._list.indexOf(view);
      if (ind !== -1) this._list.splice(ind, 1);
      this.fire("remove", view);
    }
    this._indexTmp.clear();
  }
  /**
   * Get an {@link XrView} by its associated eye constant.
   *
   * @param {string} eye - An XREYE_* view is associated with. Can be 'none' for monoscope views.
   * @returns {XrView|null} View or null if view of such eye is not available.
   */
  get(eye) {
    return this._index.get(eye) || null;
  }
  /** @private */
  _onSessionStart() {
    if (this._manager.type !== XRTYPE_AR) {
      return;
    }
    if (!this._manager.session.enabledFeatures) {
      return;
    }
    this._availableColor = this._manager.session.enabledFeatures.indexOf("camera-access") !== -1;
    this._availableDepth = this._manager.session.enabledFeatures.indexOf("depth-sensing") !== -1;
    if (this._availableDepth) {
      const session = this._manager.session;
      this._depthUsage = session.depthUsage;
      this._depthFormat = session.depthDataFormat;
    }
  }
  /** @private */
  _onSessionEnd() {
    for (const view of this._index.values()) {
      view.destroy();
    }
    this._index.clear();
    this._availableColor = false;
    this._availableDepth = false;
    this._depthUsage = "";
    this._depthFormat = "";
    this._list.length = 0;
  }
}
/**
 * Fired when a view has been added. Views are not available straight away on session start and
 * are added mid-session. They can be added/removed mid session by the underlying system. The
 * handler is passed the {@link XrView} that has been added.
 *
 * @event
 * @example
 * xr.views.on('add', (view) => {
 *     console.log('View added');
 * });
 */
__publicField(XrViews, "EVENT_ADD", "add");
/**
 * Fired when a view has been removed. They can be added/removed mid session by the underlying
 * system. The handler is passed the {@link XrView} that has been removed.
 *
 * @event
 * @example
 * xr.views.on('remove', (view) => {
 *     console.log('View removed');
 * });
 */
__publicField(XrViews, "EVENT_REMOVE", "remove");
export {
  XrViews
};
