var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Color } from "../../../core/math/color.js";
import { Vec3 } from "../../../core/math/vec3.js";
import { ShaderMaterial } from "../../../scene/materials/shader-material.js";
import { MeshInstance } from "../../../scene/mesh-instance.js";
import { Entity } from "../../../framework/entity.js";
import { CULLFACE_BACK } from "../../../platform/graphics/constants.js";
import { BLEND_NORMAL } from "../../../scene/constants.js";
import { COLOR_GRAY } from "../color.js";
import { Geometry } from "../../../scene/geometry/geometry.js";
import { unlitShader } from "../shaders.js";
const tmpG = new Geometry();
tmpG.positions = [];
tmpG.normals = [];
class Shape {
  /**
   * Create a shape.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {string} name - The name of the shape.
   * @param {ShapeArgs} args - The options for the shape.
   */
  constructor(device, name, args) {
    /**
     * The internal position of the shape.
     *
     * @protected
     */
    __publicField(this, "_position", new Vec3());
    /**
     * The internal rotation of the shape.
     *
     * @protected
     */
    __publicField(this, "_rotation", new Vec3());
    /**
     * The internal scale of the shape.
     *
     * @protected
     */
    __publicField(this, "_scale", new Vec3(1, 1, 1));
    /**
     * The internal render component layers of the shape.
     *
     * @type {number[]}
     * @protected
     */
    __publicField(this, "_layers", []);
    /**
     * The internal material state of the shape.
     *
     * @type {ShaderMaterial}
     * @protected
     */
    __publicField(this, "_material", new ShaderMaterial(unlitShader));
    /**
     * The internal disabled state of the shape.
     *
     * @protected
     */
    __publicField(this, "_disabled", false);
    /**
     * The internal visibility state of the shape.
     *
     * @protected
     */
    __publicField(this, "_visible", true);
    /**
     * The internal default color of the shape.
     *
     * @type {Color}
     * @protected
     */
    __publicField(this, "_defaultColor", Color.WHITE);
    /**
     * The internal hover color of the shape.
     *
     * @type {Color}
     * @protected
     */
    __publicField(this, "_hoverColor", Color.BLACK);
    /**
     * The internal disabled color of the shape.
     *
     * @type {Color}
     * @protected
     */
    __publicField(this, "_disabledColor", COLOR_GRAY);
    /**
     * The internal culling state of the shape.
     *
     * @type {number}
     * @protected
     */
    __publicField(this, "_cull", CULLFACE_BACK);
    /**
     * The internal depth state of the shape. -1 = interpolated depth.
     *
     * @protected
     */
    __publicField(this, "_depth", -1);
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    __publicField(this, "device");
    /**
     * The axis of the shape.
     *
     * @type {string}
     */
    __publicField(this, "axis");
    /**
     * The entity of the shape.
     *
     * @type {Entity}
     */
    __publicField(this, "entity");
    /**
     * The triangle data of the shape.
     *
     * @type {TriData[]}
     */
    __publicField(this, "triData", []);
    /**
     * The mesh instances of the shape.
     *
     * @type {MeshInstance[]}
     */
    __publicField(this, "meshInstances", []);
    this.device = device;
    this.axis = args.axis ?? "x";
    if (args.position instanceof Vec3) {
      this._position.copy(args.position);
    }
    if (args.rotation instanceof Vec3) {
      this._rotation.copy(args.rotation);
    }
    if (args.scale instanceof Vec3) {
      this._scale.copy(args.scale);
    }
    this._disabled = args.disabled ?? this._disabled;
    this._visible = args.visible ?? this._visible;
    this._layers = args.layers ?? this._layers;
    if (args.defaultColor instanceof Color) {
      this._defaultColor = args.defaultColor;
    }
    if (args.hoverColor instanceof Color) {
      this._hoverColor = args.hoverColor;
    }
    if (args.disabledColor instanceof Color) {
      this._disabledColor = args.disabledColor;
    }
    this._cull = args.cull ?? this._cull;
    this._depth = args.depth ?? this._depth;
    this.entity = new Entity(`${name}:${this.axis}`);
    this.entity.setLocalPosition(this._position);
    this.entity.setLocalEulerAngles(this._rotation);
    this.entity.setLocalScale(this._scale);
  }
  /**
   * Set the disabled state of the shape.
   *
   * @type {boolean}
   */
  set disabled(value) {
    this._disabled = value ?? false;
    this.hover(false);
  }
  /**
   * Get the disabled state of the shape.
   *
   * @type {boolean}
   */
  get disabled() {
    return this._disabled;
  }
  /**
   * Set the visibility state of the shape.
   *
   * @type {boolean}
   */
  set visible(value) {
    if (value === this._visible) {
      return;
    }
    for (let i = 0; i < this.meshInstances.length; i++) {
      this.meshInstances[i].visible = value;
    }
    this._visible = value;
  }
  /**
   * Get the visibility state of the shape.
   *
   * @type {boolean}
   */
  get visible() {
    return this._visible;
  }
  /**
   * Create a render component for an entity.
   *
   * @param {Entity} entity - The entity to create the render component for.
   * @param {Mesh[]} meshes - The meshes to create the render component with.
   * @protected
   */
  _createRenderComponent(entity, meshes) {
    const color = this._disabled ? this._disabledColor : this._defaultColor;
    this._material.setDefine("DEPTH_WRITE", this._depth > 0 ? "1" : "0");
    this._material.setParameter("uDepth", this._depth);
    this._material.setParameter("uColor", color.toArray());
    this._material.cull = this._cull;
    this._material.blendType = BLEND_NORMAL;
    this._material.update();
    const meshInstances = [];
    for (let i = 0; i < meshes.length; i++) {
      const mi = new MeshInstance(meshes[i], this._material);
      mi.cull = false;
      meshInstances.push(mi);
      this.meshInstances.push(mi);
    }
    entity.addComponent("render", {
      meshInstances,
      layers: this._layers,
      castShadows: false
    });
  }
  /**
   * Update the shape's transform.
   *
   * @protected
   */
  _update() {
    this.entity.setLocalPosition(this._position);
    this.entity.setLocalEulerAngles(this._rotation);
    this.entity.setLocalScale(this._scale);
  }
  /**
   * Sets the hover state of the shape.
   *
   * @param {boolean} state - Whether the shape is hovered.
   * @returns {void}
   */
  hover(state) {
    const color = this._disabled ? this._disabledColor : state ? this._hoverColor : this._defaultColor;
    this._material.setParameter("uColor", color.toArray());
  }
  /**
   * Destroys the shape and its entity.
   *
   * @returns {void}
   */
  destroy() {
    this.entity.destroy();
  }
}
export {
  Shape
};
