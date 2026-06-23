var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec2 } from "../../core/math/vec2.js";
import { Texture } from "../../platform/graphics/texture.js";
import { TextureUtils } from "../../platform/graphics/texture-utils.js";
class GSplatStreams {
  /**
   * Creates a new GSplatStreams instance.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {boolean} [isInstance] - Whether this manages instance-level textures (true) or
   * resource-level textures (false). Defaults to false.
   */
  constructor(device, isInstance = false) {
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    __publicField(this, "device");
    /**
     * The format defining the streams.
     *
     * @type {GSplatFormat|null}
     */
    __publicField(this, "format", null);
    /**
     * Map of texture names to Texture instances.
     *
     * @type {Map<string, Texture>}
     */
    __publicField(this, "textures", /* @__PURE__ */ new Map());
    /**
     * Texture dimensions (width and height).
     *
     * @private
     */
    __publicField(this, "_textureDimensions", new Vec2());
    /**
     * Whether this manages instance-level textures (true) or resource-level textures (false).
     *
     * @private
     */
    __publicField(this, "_isInstance", false);
    /**
     * The format version at last sync.
     *
     * @private
     */
    __publicField(this, "_formatVersion", -1);
    this.device = device;
    this._isInstance = isInstance;
  }
  /**
   * Gets the texture dimensions (width and height).
   *
   * @type {Vec2}
   */
  get textureDimensions() {
    return this._textureDimensions;
  }
  /**
   * Destroys all managed textures.
   */
  destroy() {
    for (const texture of this.textures.values()) {
      texture.destroy();
    }
    this.textures.clear();
  }
  /**
   * Initialize with format and create textures for all streams.
   *
   * @param {GSplatFormat} format - The format defining streams.
   * @param {number} numElements - Number of elements (splats) to size textures for.
   */
  init(format, numElements) {
    this.format = format;
    this._textureDimensions = TextureUtils.calcTextureSize(numElements, new Vec2());
    const streams = this._isInstance ? format.instanceStreams : format.resourceStreams;
    for (const stream of streams) {
      const texture = this.createTexture(stream.name, stream.format, this._textureDimensions);
      this.textures.set(stream.name, texture);
    }
    this._formatVersion = format.extraStreamsVersion;
  }
  /**
   * Gets a texture by name.
   *
   * @param {string} name - Texture name.
   * @returns {Texture|undefined} The texture, or undefined if not found.
   */
  getTexture(name) {
    this.syncWithFormat(this.format);
    return this.textures.get(name);
  }
  /**
   * Gets all textures in format order (streams followed by extraStreams).
   *
   * @returns {Texture[]} Array of textures in format order.
   * @ignore
   */
  getTexturesInOrder() {
    const result = [];
    if (this.format) {
      const allStreams = this._isInstance ? this.format.instanceStreams : this.format.resourceStreams;
      for (const stream of allStreams) {
        const texture = this.textures.get(stream.name);
        if (texture) {
          result.push(texture);
        }
      }
    }
    return result;
  }
  /**
   * Synchronizes textures with the format's stream definitions.
   * Creates new textures for added streams. Textures are never destroyed here -
   * streams can only be added, not removed (see GSplatFormat._extraStreams for rationale).
   *
   * @param {GSplatFormat|null} format - The format to sync with, or null to skip.
   * @ignore
   */
  syncWithFormat(format) {
    if (format) {
      if (this.format === format && this._formatVersion === format.extraStreamsVersion) {
        return;
      }
      this.format = format;
      const streams = this._isInstance ? format.instanceStreams : format.resourceStreams;
      for (const stream of streams) {
        if (!this.textures.has(stream.name)) {
          const texture = this.createTexture(stream.name, stream.format, this._textureDimensions);
          this.textures.set(stream.name, texture);
        }
      }
      this._formatVersion = format.extraStreamsVersion;
    }
  }
  /**
   * Resizes all managed textures to the specified dimensions. This assumes all textures
   * have uniform dimensions (e.g. work buffer textures). Do not use on resources with
   * mixed-size textures (e.g. SOG with differently-sized SH textures).
   *
   * @param {number} width - The new width.
   * @param {number} height - The new height.
   */
  resize(width, height) {
    this._textureDimensions.set(width, height);
    for (const texture of this.textures.values()) {
      texture.resize(width, height);
    }
  }
  /**
   * Creates a new texture with the specified parameters.
   *
   * @param {string} name - The name of the texture to be created.
   * @param {number} format - The pixel format of the texture.
   * @param {Vec2} size - The size of the texture in a Vec2 object, containing width (x) and height (y).
   * @param {Uint8Array|Uint16Array|Uint32Array|Float32Array} [data] - The initial data to fill the texture with.
   * @returns {Texture} The created texture instance.
   */
  createTexture(name, format, size, data) {
    return Texture.createDataTexture2D(this.device, name, size.x, size.y, format, data ? [data] : void 0);
  }
}
export {
  GSplatStreams
};
