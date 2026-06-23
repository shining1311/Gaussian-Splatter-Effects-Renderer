var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { StringIds } from "../../core/string-ids.js";
const stringIds = new StringIds();
class TextureView {
  /**
   * Create a new TextureView instance. Use {@link Texture#getView} instead of calling this
   * constructor directly.
   *
   * @param {Texture} texture - The texture this view references.
   * @param {number} [baseMipLevel] - The first mip level accessible to the view. Defaults to 0.
   * @param {number} [mipLevelCount] - The number of mip levels accessible to the view. Defaults
   * to 1.
   * @param {number} [baseArrayLayer] - The first array layer accessible to the view. Defaults to
   * 0.
   * @param {number} [arrayLayerCount] - The number of array layers accessible to the view.
   * Defaults to 1.
   * @ignore
   */
  constructor(texture, baseMipLevel = 0, mipLevelCount = 1, baseArrayLayer = 0, arrayLayerCount = 1) {
    /**
     * The texture this view references.
     *
     * @type {Texture}
     * @readonly
     */
    __publicField(this, "texture");
    /**
     * The first mip level accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    __publicField(this, "baseMipLevel");
    /**
     * The number of mip levels accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    __publicField(this, "mipLevelCount");
    /**
     * The first array layer accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    __publicField(this, "baseArrayLayer");
    /**
     * The number of array layers accessible to the view.
     *
     * @type {number}
     * @readonly
     */
    __publicField(this, "arrayLayerCount");
    /**
     * A unique numeric key for this view configuration, used for caching.
     *
     * @type {number}
     * @ignore
     */
    __publicField(this, "key");
    this.texture = texture;
    this.baseMipLevel = baseMipLevel;
    this.mipLevelCount = mipLevelCount;
    this.baseArrayLayer = baseArrayLayer;
    this.arrayLayerCount = arrayLayerCount;
    this.key = stringIds.get(`${baseMipLevel}:${mipLevelCount}:${baseArrayLayer}:${arrayLayerCount}`);
  }
}
export {
  TextureView
};
