import { EventHandler } from "../../core/event-handler.js";
import { Pose } from "./pose.js";
class InputDelta {
	_value;
	constructor(arg) {
		if (Array.isArray(arg)) {
			this._value = arg.slice();
		} else {
			this._value = new Array(+arg).fill(0);
		}
	}
	add(other) {
		for (let i = 0; i < this._value.length; i++) {
			this._value[i] += other._value[i] || 0;
		}
		return this;
	}
	append(offsets) {
		for (let i = 0; i < this._value.length; i++) {
			this._value[i] += offsets[i] || 0;
		}
		return this;
	}
	copy(other) {
		for (let i = 0; i < this._value.length; i++) {
			this._value[i] = other._value[i] || 0;
		}
		return this;
	}
	length() {
		let sum = 0;
		for (const value of this._value) {
			sum += value * value;
		}
		return Math.sqrt(sum);
	}
	read() {
		const value = this._value.slice();
		this._value.fill(0);
		return value;
	}
}
class InputFrame {
	deltas = {};
	constructor(data) {
		for (const name in data) {
			this.deltas[name] = new InputDelta(data[name]);
		}
	}
	read() {
		const frame = {};
		for (const name in this.deltas) {
			frame[name] = this.deltas[name].read();
		}
		return frame;
	}
}
class InputSource extends InputFrame {
	_element = null;
	_events = new EventHandler();
	on(event, callback) {
		this._events.on(event, callback);
	}
	off(event, callback) {
		this._events.off(event, callback);
	}
	fire(event, ...args) {
		this._events.fire(event, ...args);
	}
	attach(element) {
		if (this._element) {
			this.detach();
		}
		this._element = element;
	}
	detach() {
		if (!this._element) {
			return;
		}
		this._element = null;
		this.read();
	}
	destroy() {
		this.detach();
		this._events.off();
	}
}
class InputConsumer {
	update(frame, dt) {
		frame.read();
	}
}
class InputController extends InputConsumer {
	_pose = new Pose();
	attach(pose, smooth = true) {
	}
	detach() {
	}
	update(frame, dt) {
		super.update(frame, dt);
		return this._pose;
	}
	destroy() {
		this.detach();
	}
}
export {
	InputConsumer,
	InputController,
	InputDelta,
	InputFrame,
	InputSource
};
