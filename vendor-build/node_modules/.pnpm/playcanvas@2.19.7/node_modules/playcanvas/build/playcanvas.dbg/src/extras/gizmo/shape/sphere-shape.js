var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { SphereGeometry } from "../../../scene/geometry/sphere-geometry.js";
import { Mesh } from "../../../scene/mesh.js";
import { TriData } from "../tri-data.js";
import { Shape } from "./shape.js";
class SphereShape extends Shape {
  /**
   * Create a new SphereShape.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {ShapeArgs & SphereShapeArgs} args - The shape options.
   */
  constructor(device, args = {}) {
    super(device, "sphereCenter", args);
    /**
     * The internal size of the sphere.
     *
     * @private
     */
    __publicField(this, "_radius", 0.03);
    this._radius = args.radius ?? this._radius;
    this.triData = [
      new TriData(new SphereGeometry(), 2)
    ];
    this._createRenderComponent(this.entity, [
      Mesh.fromGeometry(this.device, new SphereGeometry({
        latitudeBands: 32,
        longitudeBands: 32
      }))
    ]);
    this._update();
  }
  /**
   * Set the rendered radius of the sphere.
   *
   * @param {number} value - The new radius of the sphere.
   */
  set radius(value) {
    this._radius = value ?? this._radius;
    this._update();
  }
  /**
   * Get the rendered radius of the sphere.
   *
   * @returns {number} The radius of the sphere.
   */
  get radius() {
    return this._radius;
  }
  /**
   * Update the shape's transform.
   *
   * @protected
   * @override
   */
  _update() {
    const scale = this._radius * 2;
    this.entity.setLocalScale(scale, scale, scale);
  }
}
export {
  SphereShape
};
