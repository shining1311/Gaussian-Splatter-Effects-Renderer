import { platform } from "../../core/platform.js";
import { EventHandler } from "../../core/event-handler.js";
import { XRSPACE_VIEWER } from "./constants.js";
import { XrHitTestSource } from "./xr-hit-test-source.js";
class XrHitTest extends EventHandler {
	static EVENT_AVAILABLE = "available";
	static EVENT_UNAVAILABLE = "unavailable";
	static EVENT_ADD = "add";
	static EVENT_REMOVE = "remove";
	static EVENT_RESULT = "result";
	static EVENT_ERROR = "error";
	manager;
	_supported = platform.browser && !!(window.XRSession && window.XRSession.prototype.requestHitTestSource);
	_available = false;
	_checkingAvailability = false;
	sources = [];
	constructor(manager) {
		super();
		this.manager = manager;
		if (this._supported) {
			this.manager.on("start", this._onSessionStart, this);
			this.manager.on("end", this._onSessionEnd, this);
		}
	}
	_onSessionStart() {
		if (this.manager.session.enabledFeatures) {
			const available = this.manager.session.enabledFeatures.indexOf("hit-test") !== -1;
			if (!available) return;
			this._available = available;
			this.fire("available");
		} else if (!this._checkingAvailability) {
			this._checkingAvailability = true;
			this.manager.session.requestReferenceSpace(XRSPACE_VIEWER).then((referenceSpace) => {
				this.manager.session.requestHitTestSource({
					space: referenceSpace
				}).then((hitTestSource) => {
					hitTestSource.cancel();
					if (this.manager.active) {
						this._available = true;
						this.fire("available");
					}
				}).catch(() => {
				});
			}).catch(() => {
			});
		}
	}
	_onSessionEnd() {
		if (!this._available) return;
		this._available = false;
		for (let i = 0; i < this.sources.length; i++) {
			this.sources[i].onStop();
		}
		this.sources = [];
		this.fire("unavailable");
	}
	start(options = {}) {
		if (!this._supported) {
			options.callback?.(new Error("XR HitTest is not supported"), null);
			return;
		}
		if (!this._available) {
			options.callback?.(new Error("XR HitTest is not available"), null);
			return;
		}
		if (!options.profile && !options.spaceType) {
			options.spaceType = XRSPACE_VIEWER;
		}
		let xrRay;
		const offsetRay = options.offsetRay;
		if (offsetRay) {
			const origin = new DOMPoint(offsetRay.origin.x, offsetRay.origin.y, offsetRay.origin.z, 1);
			const direction = new DOMPoint(offsetRay.direction.x, offsetRay.direction.y, offsetRay.direction.z, 0);
			xrRay = new XRRay(origin, direction);
		}
		const callback = options.callback;
		if (options.spaceType) {
			this.manager.session.requestReferenceSpace(options.spaceType).then((referenceSpace) => {
				if (!this.manager.session) {
					const err = new Error("XR Session is not started (2)");
					if (callback) callback(err);
					this.fire("error", err);
					return;
				}
				this.manager.session.requestHitTestSource({
					space: referenceSpace,
					entityTypes: options.entityTypes || void 0,
					offsetRay: xrRay
				}).then((xrHitTestSource) => {
					this._onHitTestSource(xrHitTestSource, false, options.inputSource, callback);
				}).catch((ex) => {
					if (callback) callback(ex);
					this.fire("error", ex);
				});
			}).catch((ex) => {
				if (callback) callback(ex);
				this.fire("error", ex);
			});
		} else {
			this.manager.session.requestHitTestSourceForTransientInput({
				profile: options.profile,
				entityTypes: options.entityTypes || void 0,
				offsetRay: xrRay
			}).then((xrHitTestSource) => {
				this._onHitTestSource(xrHitTestSource, true, options.inputSource, callback);
			}).catch((ex) => {
				if (callback) callback(ex);
				this.fire("error", ex);
			});
		}
	}
	_onHitTestSource(xrHitTestSource, transient, inputSource, callback) {
		if (!this.manager.session) {
			xrHitTestSource.cancel();
			const err = new Error("XR Session is not started (3)");
			if (callback) callback(err);
			this.fire("error", err);
			return;
		}
		const hitTestSource = new XrHitTestSource(this.manager, xrHitTestSource, transient, inputSource ?? null);
		this.sources.push(hitTestSource);
		if (callback) callback(null, hitTestSource);
		this.fire("add", hitTestSource);
	}
	update(frame) {
		if (!this._available) {
			return;
		}
		for (let i = 0; i < this.sources.length; i++) {
			this.sources[i].update(frame);
		}
	}
	get supported() {
		return this._supported;
	}
	get available() {
		return this._available;
	}
}
export {
	XrHitTest
};
