var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { LAYERID_WORLD } from "../constants.js";
class BatchGroup {
  /**
   * Create a new BatchGroup instance.
   *
   * @param {number} id - Unique id. Can be assigned to model, render and element components.
   * @param {string} name - The name of the group.
   * @param {boolean} dynamic - Whether objects within this batch group should support
   * transforming at runtime.
   * @param {number} maxAabbSize - Maximum size of any dimension of a bounding box around batched
   * objects. {@link BatchManager#prepare} will split objects into local groups based on this
   * size.
   * @param {number[]} [layers] - Layer ID array. Default is [{@link LAYERID_WORLD}]. The whole
   * batch group will belong to these layers. Layers of source models will be ignored.
   */
  constructor(id, name, dynamic, maxAabbSize, layers = [LAYERID_WORLD]) {
    /** @private */
    __publicField(this, "_ui", false);
    /** @private */
    __publicField(this, "_sprite", false);
    /** @private */
    __publicField(this, "_obj", {
      model: [],
      element: [],
      sprite: [],
      render: []
    });
    /**
     * Unique id. Can be assigned to model, render and element components.
     *
     * @type {number}
     */
    __publicField(this, "id");
    /**
     * Name of the group.
     *
     * @type {string}
     */
    __publicField(this, "name");
    /**
     * Whether objects within this batch group should support transforming at runtime.
     *
     * @type {boolean}
     */
    __publicField(this, "dynamic");
    /**
     * Maximum size of any dimension of a bounding box around batched objects.
     * {@link BatchManager#prepare} will split objects into local groups based on this size.
     *
     * @type {number}
     */
    __publicField(this, "maxAabbSize");
    /**
     * Layer ID array. Default is [{@link LAYERID_WORLD}]. The whole batch group will belong to
     * these layers. Layers of source models will be ignored.
     *
     * @type {number[]}
     */
    __publicField(this, "layers");
    this.id = id;
    this.name = name;
    this.dynamic = dynamic;
    this.maxAabbSize = maxAabbSize;
    this.layers = layers;
  }
}
__publicField(BatchGroup, "MODEL", "model");
__publicField(BatchGroup, "ELEMENT", "element");
__publicField(BatchGroup, "SPRITE", "sprite");
__publicField(BatchGroup, "RENDER", "render");
export {
  BatchGroup
};
