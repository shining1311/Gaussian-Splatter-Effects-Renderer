var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { TorusGeometry } from "../../../scene/geometry/torus-geometry.js";
import { Mesh } from "../../../scene/mesh.js";
import { TriData } from "../tri-data.js";
import { Shape } from "./shape.js";
const TORUS_RENDER_SEGMENTS = 80;
const TORUS_INTERSECT_SEGMENTS = 20;
class ArcShape extends Shape {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {ShapeArgs & ArcShapeArgs} args - The shape options.
   */
  constructor(device, args = {}) {
    super(device, "disk", args);
    /**
     * The internal tube radius of the arc.
     *
     * @private
     */
    __publicField(this, "_tubeRadius", 0.01);
    /**
     * The internal ring radius of the arc.
     *
     * @private
     */
    __publicField(this, "_ringRadius", 0.5);
    /**
     * The internal sector angle of the arc.
     *
     * @private
     */
    __publicField(this, "_sectorAngle", 360);
    /**
     * The internal intersection tolerance of the arc.
     *
     * @private
     */
    __publicField(this, "_tolerance", 0.05);
    /**
     * The internal cache for triangle data.
     *
     * @type {[TriData, TriData]}
     * @private
     */
    __publicField(this, "_triDataCache");
    this._tubeRadius = args.tubeRadius ?? this._tubeRadius;
    this._ringRadius = args.ringRadius ?? this._ringRadius;
    this._sectorAngle = args.sectorAngle ?? this._sectorAngle;
    this._triDataCache = [
      new TriData(this._createTorusGeometry(this._sectorAngle)),
      new TriData(this._createTorusGeometry(360))
    ];
    this.triData = [this._triDataCache[0]];
    this._createRenderComponent(this.entity, [
      this._createTorusMesh(this._sectorAngle),
      this._createTorusMesh(360)
    ]);
    this.show("sector");
    this._update();
  }
  /**
   * Create the torus geometry.
   *
   * @param {number} sectorAngle - The sector angle.
   * @returns {TorusGeometry} The torus geometry.
   * @private
   */
  _createTorusGeometry(sectorAngle) {
    return new TorusGeometry({
      tubeRadius: this._tubeRadius + this._tolerance,
      ringRadius: this._ringRadius,
      sectorAngle,
      segments: TORUS_INTERSECT_SEGMENTS
    });
  }
  /**
   * Create the torus mesh.
   *
   * @param {number} sectorAngle - The sector angle.
   * @returns {Mesh} The torus mesh.
   * @private
   */
  _createTorusMesh(sectorAngle) {
    const geom = new TorusGeometry({
      tubeRadius: this._tubeRadius,
      ringRadius: this._ringRadius,
      sectorAngle,
      segments: TORUS_RENDER_SEGMENTS
    });
    return Mesh.fromGeometry(this.device, geom);
  }
  /**
   * Set the tube radius.
   *
   * @type {number}
   */
  set tubeRadius(value) {
    this._tubeRadius = value ?? this._tubeRadius;
    this._update();
  }
  /**
   * Get the tube radius.
   *
   * @type {number}
   */
  get tubeRadius() {
    return this._tubeRadius;
  }
  /**
   * Set the ring radius.
   *
   * @type {number}
   */
  set ringRadius(value) {
    this._ringRadius = value ?? this._ringRadius;
    this._update();
  }
  /**
   * Get the ring radius.
   *
   * @type {number}
   */
  get ringRadius() {
    return this._ringRadius;
  }
  /**
   * Set the intersection tolerance.
   *
   * @type {number}
   */
  set tolerance(value) {
    this._tolerance = value ?? this._tolerance;
    this._update();
  }
  /**
   * Get the intersection tolerance.
   *
   * @type {number}
   */
  get tolerance() {
    return this._tolerance;
  }
  /**
   * Update the shape's transform.
   *
   * @protected
   * @override
   */
  _update() {
    this._triDataCache[0].fromGeometry(this._createTorusGeometry(this._sectorAngle));
    this._triDataCache[1].fromGeometry(this._createTorusGeometry(360));
    this.meshInstances[0].mesh = this._createTorusMesh(this._sectorAngle);
    this.meshInstances[1].mesh = this._createTorusMesh(360);
  }
  /**
   * @param {'sector' | 'ring' | 'none'} state - The visibility state.
   */
  show(state) {
    switch (state) {
      case "sector": {
        this.triData[0] = this._triDataCache[0];
        this.meshInstances[0].visible = true;
        this.meshInstances[1].visible = false;
        break;
      }
      case "ring": {
        this.triData[0] = this._triDataCache[1];
        this.meshInstances[0].visible = false;
        this.meshInstances[1].visible = true;
        break;
      }
      case "none": {
        this.meshInstances[0].visible = false;
        this.meshInstances[1].visible = false;
        break;
      }
    }
  }
}
export {
  ArcShape
};
