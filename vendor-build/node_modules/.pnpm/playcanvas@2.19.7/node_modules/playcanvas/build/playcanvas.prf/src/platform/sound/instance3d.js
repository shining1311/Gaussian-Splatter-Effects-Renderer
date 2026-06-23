import { Vec3 } from "../../core/math/vec3.js";
import { DISTANCE_LINEAR } from "./constants.js";
import { SoundInstance } from "./instance.js";
const MAX_DISTANCE = 1e4;
class SoundInstance3d extends SoundInstance {
	_position = new Vec3();
	_velocity = new Vec3();
	constructor(manager, sound, options = {}) {
		super(manager, sound, options);
		if (!manager.context) {
			return;
		}
		if (options.position) {
			this.position = options.position;
		}
		this.maxDistance = options.maxDistance !== void 0 ? Number(options.maxDistance) : MAX_DISTANCE;
		this.refDistance = options.refDistance !== void 0 ? Number(options.refDistance) : 1;
		this.rollOffFactor = options.rollOffFactor !== void 0 ? Number(options.rollOffFactor) : 1;
		this.distanceModel = options.distanceModel !== void 0 ? options.distanceModel : DISTANCE_LINEAR;
	}
	_initializeNodes() {
		this.gain = this._manager.context.createGain();
		this.panner = this._manager.context.createPanner();
		this.panner.connect(this.gain);
		this._inputNode = this.panner;
		this._connectorNode = this.gain;
		this._connectorNode.connect(this._manager.context.destination);
	}
	set position(value) {
		this._position.copy(value);
		const panner = this.panner;
		if (!panner) {
			return;
		}
		if ("positionX" in panner) {
			panner.positionX.value = value.x;
			panner.positionY.value = value.y;
			panner.positionZ.value = value.z;
		} else if (panner.setPosition) {
			panner.setPosition(value.x, value.y, value.z);
		}
	}
	get position() {
		return this._position;
	}
	set velocity(velocity) {
		this._velocity.copy(velocity);
	}
	get velocity() {
		return this._velocity;
	}
	set maxDistance(value) {
		if (this.panner) {
			this.panner.maxDistance = value;
		}
	}
	get maxDistance() {
		return this.panner ? this.panner.maxDistance : 0;
	}
	set refDistance(value) {
		if (this.panner) {
			this.panner.refDistance = value;
		}
	}
	get refDistance() {
		return this.panner ? this.panner.refDistance : 0;
	}
	set rollOffFactor(value) {
		if (this.panner) {
			this.panner.rolloffFactor = value;
		}
	}
	get rollOffFactor() {
		return this.panner ? this.panner.rolloffFactor : 0;
	}
	set distanceModel(value) {
		if (this.panner) {
			this.panner.distanceModel = value;
		}
	}
	get distanceModel() {
		return this.panner ? this.panner.distanceModel : DISTANCE_LINEAR;
	}
}
export {
	SoundInstance3d
};
