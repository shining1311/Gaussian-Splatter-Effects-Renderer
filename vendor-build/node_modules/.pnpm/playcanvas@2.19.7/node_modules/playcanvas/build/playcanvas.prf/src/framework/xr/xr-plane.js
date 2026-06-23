import { EventHandler } from "../../core/event-handler.js";
import { Quat } from "../../core/math/quat.js";
import { Vec3 } from "../../core/math/vec3.js";
let ids = 0;
class XrPlane extends EventHandler {
	static EVENT_REMOVE = "remove";
	static EVENT_CHANGE = "change";
	_id;
	_planeDetection;
	_xrPlane;
	_lastChangedTime;
	_orientation;
	_position = new Vec3();
	_rotation = new Quat();
	constructor(planeDetection, xrPlane) {
		super();
		this._id = ++ids;
		this._planeDetection = planeDetection;
		this._xrPlane = xrPlane;
		this._lastChangedTime = xrPlane.lastChangedTime;
		this._orientation = xrPlane.orientation;
	}
	destroy() {
		if (!this._xrPlane) return;
		this._xrPlane = null;
		this.fire("remove");
	}
	update(frame) {
		const manager = this._planeDetection._manager;
		const pose = frame.getPose(this._xrPlane.planeSpace, manager._referenceSpace);
		if (pose) {
			this._position.copy(pose.transform.position);
			this._rotation.copy(pose.transform.orientation);
		}
		if (this._lastChangedTime !== this._xrPlane.lastChangedTime) {
			this._lastChangedTime = this._xrPlane.lastChangedTime;
			this.fire("change");
		}
	}
	getPosition() {
		return this._position;
	}
	getRotation() {
		return this._rotation;
	}
	get id() {
		return this._id;
	}
	get orientation() {
		return this._orientation;
	}
	get points() {
		return this._xrPlane.polygon;
	}
	get label() {
		return this._xrPlane.semanticLabel || "";
	}
}
export {
	XrPlane
};
