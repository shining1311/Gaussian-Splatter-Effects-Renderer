var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const _Tracing = class _Tracing {
  /**
   * Enable or disable a trace channel.
   *
   * @param {string} channel - Name of the trace channel. Can be:
   *
   * - {@link TRACEID_RENDER_FRAME}
   * - {@link TRACEID_RENDER_FRAME_TIME}
   * - {@link TRACEID_RENDER_PASS}
   * - {@link TRACEID_RENDER_PASS_DETAIL}
   * - {@link TRACEID_RENDER_ACTION}
   * - {@link TRACEID_RENDER_TARGET_ALLOC}
   * - {@link TRACEID_TEXTURE_ALLOC}
   * - {@link TRACEID_SHADER_ALLOC}
   * - {@link TRACEID_SHADER_COMPILE}
   * - {@link TRACEID_VRAM_TEXTURE}
   * - {@link TRACEID_VRAM_VB}
   * - {@link TRACEID_VRAM_IB}
   * - {@link TRACEID_RENDERPIPELINE_ALLOC}
   * - {@link TRACEID_COMPUTEPIPELINE_ALLOC}
   * - {@link TRACEID_PIPELINELAYOUT_ALLOC}
   * - {@link TRACEID_TEXTURES}
   * - {@link TRACEID_BUFFERS}
   * - {@link TRACEID_ASSETS}
   * - {@link TRACEID_GPU_TIMINGS}
   *
   * @param {boolean} enabled - New enabled state for the channel.
   */
  static set(channel, enabled = true) {
    if (enabled) {
      _Tracing._traceChannels.add(channel);
    } else {
      _Tracing._traceChannels.delete(channel);
    }
  }
  /**
   * Test if the trace channel is enabled.
   *
   * @param {string} channel - Name of the trace channel.
   * @returns {boolean} - True if the trace channel is enabled.
   */
  static get(channel) {
    return _Tracing._traceChannels.has(channel);
  }
};
/**
 * Set storing the names of enabled trace channels.
 *
 * @type {Set<string>}
 * @private
 */
__publicField(_Tracing, "_traceChannels", /* @__PURE__ */ new Set());
/**
 * Enable call stack logging for trace calls. Defaults to false.
 *
 * @type {boolean}
 */
__publicField(_Tracing, "stack", false);
let Tracing = _Tracing;
export {
  Tracing
};
