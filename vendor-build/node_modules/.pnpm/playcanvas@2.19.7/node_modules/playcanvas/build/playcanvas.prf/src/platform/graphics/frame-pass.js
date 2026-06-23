import { Tracing } from "../../core/tracing.js";
import { TRACEID_RENDER_PASS } from "../../core/constants.js";
class FramePass {
	_name;
	device;
	_enabled = true;
	_skipStart = false;
	_skipEnd = false;
	executeEnabled = true;
	requiresCubemaps = false;
	beforePasses = [];
	afterPasses = [];
	constructor(graphicsDevice) {
		this.device = graphicsDevice;
	}
	set name(value) {
		this._name = value;
	}
	get name() {
		if (!this._name) {
			this._name = this.constructor.name;
		}
		return this._name;
	}
	set enabled(value) {
		if (this._enabled !== value) {
			this._enabled = value;
			if (value) {
				this.onEnable();
			} else {
				this.onDisable();
			}
		}
	}
	get enabled() {
		return this._enabled;
	}
	onEnable() {
	}
	onDisable() {
	}
	frameUpdate() {
	}
	before() {
	}
	execute() {
	}
	after() {
	}
	destroy() {
	}
	render() {
		if (this.enabled) {
			this.before();
			if (this.executeEnabled) {
				this.execute();
			}
			this.after();
			this.device.renderPassIndex++;
		}
	}
}
export {
	FramePass
};
