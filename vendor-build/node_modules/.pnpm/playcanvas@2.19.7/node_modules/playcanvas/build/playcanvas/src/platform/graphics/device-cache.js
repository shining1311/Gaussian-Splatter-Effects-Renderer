class DeviceCache {
	_cache = /* @__PURE__ */ new Map();
	get(device, onCreate) {
		if (!this._cache.has(device)) {
			this._cache.set(device, onCreate());
			device.on("destroy", () => {
				this.remove(device);
			});
			device.on("devicelost", () => {
				this._cache.get(device)?.loseContext?.(device);
			});
		}
		return this._cache.get(device);
	}
	remove(device) {
		this._cache.get(device)?.destroy?.(device);
		this._cache.delete(device);
	}
}
export {
	DeviceCache
};
