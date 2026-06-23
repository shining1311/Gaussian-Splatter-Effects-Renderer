var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../core/debug.js";
import { math } from "../../core/math/math.js";
import { BoundingBox } from "../../core/shape/bounding-box.js";
import { GSplatResourceBase } from "./gsplat-resource-base.js";
class GSplatContainer extends GSplatResourceBase {
  /**
   * Creates a new GSplatContainer instance.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {number} maxSplats - Maximum number of splats this container can hold.
   * @param {GSplatFormat} format - The format descriptor with streams and read code. Use
   * {@link GSplatFormat.createDefaultFormat} for the built-in format, or create a custom
   * {@link GSplatFormat}.
   */
  constructor(device, maxSplats, format) {
    Debug.assert(format);
    const aabb = new BoundingBox();
    const gsplatData = {
      numSplats: maxSplats,
      getCenters: () => null,
      calcAabb: (box) => box.copy(aabb)
    };
    super(device, gsplatData, { prepareCenters: false });
    /**
     * Maximum number of splats this container can hold.
     *
     * Internal note: We cannot (easily) implement resizing of the container, due textures needing
     * to be constant for the world state in GsplatInfo. This is non-issue for gpu based sorting
     * of course, but not for cpu based sorting. The workaround is to recreate container when the
     * size changes.
     *
     * @private
     */
    __publicField(this, "_maxSplats", 0);
    /**
     * Current number of splats to render.
     *
     * @private
     */
    __publicField(this, "_numSplats", 0);
    this._format = format;
    this._maxSplats = maxSplats;
    this._numSplats = maxSplats;
    this.streams.init(this._format, maxSplats);
  }
  /**
   * CPU-side xyz per splat. Allocated lazily on first read; GPU-only rendering can omit touching
   * this property to avoid the extra buffer.
   *
   * @type {Float32Array}
   */
  set centers(value) {
    this._centers = value;
  }
  get centers() {
    if (this._centers === null) {
      this._centers = new Float32Array(this._maxSplats * 3);
      this.centersVersion++;
    }
    return (
      /** @type {Float32Array} */
      this._centers
    );
  }
  /**
   * Maximum number of splats this container can hold.
   *
   * @type {number}
   */
  get maxSplats() {
    return this._maxSplats;
  }
  /**
   * Gets the number of splats to render.
   *
   * @type {number}
   */
  get numSplats() {
    return this._numSplats;
  }
  /**
   * Updates the container after modifying texture data and centers. Call this after filling
   * data to signal that the container contents have changed.
   *
   * @param {number} [numSplats] - Number of splats to render. Defaults to current value.
   * Must be between 0 and {@link maxSplats}.
   * @param {boolean} [centersUpdated] - Whether the centers array was modified. Set to
   * false when only numSplats changes but center positions remain the same, to avoid the cost
   * of re-cloning centers in the sorter (can be significant for large containers).
   */
  update(numSplats = this._numSplats, centersUpdated = true) {
    this._numSplats = math.clamp(numSplats, 0, this._maxSplats);
    if (centersUpdated) {
      this.centersVersion++;
    }
  }
  /**
   * Configures material defines for this container.
   *
   * @param {Map<string, string>} defines - The defines map to configure.
   * @ignore
   */
  configureMaterialDefines(defines) {
    defines.set("SH_BANDS", "0");
  }
  /**
   * Configures a material to use this container's data.
   *
   * @param {ShaderMaterial} material - The material to configure.
   * @ignore
   */
  configureMaterial(material, workBufferModifier = null, formatDeclarations) {
    super.configureMaterial(material, workBufferModifier, formatDeclarations);
    const chunks = this.device.isWebGPU ? material.shaderChunks.wgsl : material.shaderChunks.glsl;
    chunks.set("gsplatContainerDeclarationsVS", this.format.getInputDeclarations());
    chunks.set("gsplatDeclarationsVS", '#include "gsplatContainerDeclVS"');
    chunks.set("gsplatReadVS", this.format.getReadCode());
  }
}
export {
  GSplatContainer
};
