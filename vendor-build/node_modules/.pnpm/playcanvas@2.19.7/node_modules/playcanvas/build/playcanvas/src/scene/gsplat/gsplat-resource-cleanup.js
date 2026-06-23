import { DeviceCache } from "../../platform/graphics/device-cache.js";
class GSplatResourceCleanup {
	static _cache = new DeviceCache();
	_pendingDestroy = /* @__PURE__ */ new Set();
	static queueDestroy(device, resource) {
		this._cache.get(device, () => new GSplatResourceCleanup())._pendingDestroy.add(resource);
	}
	static process(device) {
		const pending = this._cache.get(device, () => new GSplatResourceCleanup())._pendingDestroy;
		for (const resource of pending) {
			if (resource.refCount === 0) {
				resource._actualDestroy();
				pending.delete(resource);
			}
		}
	}
	destroy() {
		this._pendingDestroy.clear();
	}
}
export {
	GSplatResourceCleanup
};
