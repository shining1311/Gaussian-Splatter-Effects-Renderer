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
	_position = new Vec3();
	_rotation = new Vec3();
	_scale = new Vec3(1, 1, 1);
	_layers = [];
	_material = new ShaderMaterial(unlitShader);
	_disabled = false;
	_visible = true;
	_defaultColor = Color.WHITE;
	_hoverColor = Color.BLACK;
	_disabledColor = COLOR_GRAY;
	_cull = CULLFACE_BACK;
	_depth = -1;
	device;
	axis;
	entity;
	triData = [];
	meshInstances = [];
	constructor(device, name, args) {
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
	set disabled(value) {
		this._disabled = value ?? false;
		this.hover(false);
	}
	get disabled() {
		return this._disabled;
	}
	set visible(value) {
		if (value === this._visible) {
			return;
		}
		for (let i = 0; i < this.meshInstances.length; i++) {
			this.meshInstances[i].visible = value;
		}
		this._visible = value;
	}
	get visible() {
		return this._visible;
	}
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
	_update() {
		this.entity.setLocalPosition(this._position);
		this.entity.setLocalEulerAngles(this._rotation);
		this.entity.setLocalScale(this._scale);
	}
	hover(state) {
		const color = this._disabled ? this._disabledColor : state ? this._hoverColor : this._defaultColor;
		this._material.setParameter("uColor", color.toArray());
	}
	destroy() {
		this.entity.destroy();
	}
}
export {
	Shape
};
