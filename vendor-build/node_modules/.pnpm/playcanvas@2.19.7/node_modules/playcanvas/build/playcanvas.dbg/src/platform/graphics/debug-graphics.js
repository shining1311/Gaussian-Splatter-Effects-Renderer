var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const _DebugGraphics = class _DebugGraphics {
  /**
   * Clear internal stack of the GPU markers. It should be called at the start of the frame to
   * prevent the array growing if there are exceptions during the rendering.
   */
  static clearGpuMarkers() {
    _DebugGraphics.markers.length = 0;
  }
  /**
   * Push GPU marker to the stack on the device.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {string} name - The name of the marker.
   */
  static pushGpuMarker(device, name) {
    _DebugGraphics.markers.push(name);
    device.pushMarker(name);
  }
  /**
   * Pop GPU marker from the stack on the device.
   *
   * @param {GraphicsDevice} device - The graphics device.
   */
  static popGpuMarker(device) {
    if (_DebugGraphics.markers.length) {
      _DebugGraphics.markers.pop();
    }
    device.popMarker();
  }
  /**
   * Converts current markers into a single string format.
   *
   * @returns {string} String representation of current markers.
   */
  static toString() {
    return _DebugGraphics.markers.join(" | ");
  }
};
/**
 * An array of markers, representing a stack.
 *
 * @type {string[]}
 * @private
 */
__publicField(_DebugGraphics, "markers", []);
let DebugGraphics = _DebugGraphics;
export {
  DebugGraphics
};
