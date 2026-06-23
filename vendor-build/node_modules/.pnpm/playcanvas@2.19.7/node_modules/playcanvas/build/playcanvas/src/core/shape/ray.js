import { Vec3 } from "../math/vec3.js";
class Ray {
	origin = new Vec3();
	direction = Vec3.FORWARD.clone();
	constructor(origin, direction) {
		if (origin) {
			this.origin.copy(origin);
		}
		if (direction) {
			this.direction.copy(direction);
		}
	}
	set(origin, direction) {
		this.origin.copy(origin);
		this.direction.copy(direction);
		return this;
	}
	copy(src) {
		return this.set(src.origin, src.direction);
	}
	clone() {
		return new this.constructor(this.origin, this.direction);
	}
}
export {
	Ray
};
