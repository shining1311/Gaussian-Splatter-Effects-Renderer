var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { BoxGeometry } from "../../../scene/geometry/box-geometry.js";
import { Mesh } from "../../../scene/mesh.js";
import { TriData } from "../tri-data.js";
import { Shape } from "./shape.js";
class BoxShape extends Shape {
  /**
   * Create a new BoxShape.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {ShapeArgs & BoxShapeArgs} args - The shape options.
   */
  constructor(device, args = {}) {
    super(device, "boxCenter", args);
    /**
     * The internal size of the box.
     *
     * @private
     */
    __publicField(this, "_size", 0.06);
    this._size = args.size ?? this._size;
    this.triData = [
      new TriData(new BoxGeometry(), 2)
    ];
    this._createRenderComponent(this.entity, [
      Mesh.fromGeometry(this.device, new BoxGeometry())
    ]);
    this._update();
  }
  /**
   * Set the rendered size of the box.
   *
   * @param {number} value - The new size of the box.
   */
  set size(value) {
    this._size = value ?? this._size;
    this._update();
  }
  /**
   * Get the rendered size of the box.
   *
   * @returns {number} The size of the box.
   */
  get size() {
    return this._size;
  }
  /**
   * Update the shapes's transform.
   *
   * @protected
   * @override
   */
  _update() {
    this.entity.setLocalScale(this._size, this._size, this._size);
  }
}
export {
  BoxShape
};
