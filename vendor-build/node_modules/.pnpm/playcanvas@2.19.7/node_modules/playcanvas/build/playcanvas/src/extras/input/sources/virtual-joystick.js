import { math } from "../../../core/math/math.js";
import { Vec2 } from "../../../core/math/vec2.js";
const v = new Vec2();
class VirtualJoystick {
	_range = 70;
	_position = new Vec2();
	_value = new Vec2();
	constructor({ range } = {}) {
		this._range = range ?? this._range;
	}
	get value() {
		return this._value;
	}
	down(x, y) {
		this._position.set(x, y);
		this._value.set(0, 0);
		return [x, y, x, y];
	}
	move(x, y) {
		v.set(x - this._position.x, y - this._position.y);
		if (v.length() > this._range) {
			v.normalize().mulScalar(this._range);
		}
		this._value.set(
			math.clamp(v.x / this._range, -1, 1),
			math.clamp(v.y / this._range, -1, 1)
		);
		const { x: bx, y: by } = this._position;
		return [bx, by, bx + v.x, by + v.y];
	}
	up() {
		this._position.set(0, 0);
		this._value.set(0, 0);
		return [-1, -1, -1, -1];
	}
}
export {
	VirtualJoystick
};
