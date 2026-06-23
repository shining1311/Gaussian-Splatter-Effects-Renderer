import { EventHandler } from "../../core/event-handler.js";
import { Asset } from "./asset.js";
class AssetListLoader extends EventHandler {
	_assets = /* @__PURE__ */ new Set();
	_loadingAssets = /* @__PURE__ */ new Set();
	_waitingAssets = /* @__PURE__ */ new Set();
	_loading = false;
	_loaded = false;
	_failed = [];
	constructor(assetList, assetRegistry) {
		super();
		this._registry = assetRegistry;
		assetList.forEach((a) => {
			if (a instanceof Asset) {
				if (!a.registry) {
					a.registry = assetRegistry;
				}
				this._assets.add(a);
			} else {
				const asset = assetRegistry.get(a);
				if (asset) {
					this._assets.add(asset);
				} else {
					this._waitForAsset(a);
				}
			}
		});
	}
	destroy() {
		this._registry.off("load", this._onLoad);
		this._registry.off("error", this._onError);
		this._waitingAssets.forEach((id) => {
			this._registry.off(`add:${id}`, this._onAddAsset);
		});
		this.off("progress");
		this.off("load");
	}
	_assetHasDependencies(asset) {
		return asset.type === "model" && asset.file?.url && asset.file.url && asset.file.url.match(/.json$/g);
	}
	load(done, scope) {
		if (this._loading) {
			return;
		}
		this._loading = true;
		this._callback = done;
		this._scope = scope;
		this._registry.on("load", this._onLoad, this);
		this._registry.on("error", this._onError, this);
		let loadingAssets = false;
		this._assets.forEach((asset) => {
			if (!asset.loaded) {
				loadingAssets = true;
				if (this._assetHasDependencies(asset)) {
					this._registry.loadFromUrl(asset.file.url, asset.type, (err, loadedAsset) => {
						if (err) {
							this._onError(err, asset);
							return;
						}
						this._onLoad(asset);
					});
				}
				this._loadingAssets.add(asset);
				this._registry.add(asset);
			}
		});
		this._loadingAssets.forEach((asset) => {
			if (!this._assetHasDependencies(asset)) {
				this._registry.load(asset);
			}
		});
		if (!loadingAssets && this._waitingAssets.size === 0) {
			this._loadingComplete();
		}
	}
	ready(done, scope = this) {
		if (this._loaded) {
			done.call(scope, Array.from(this._assets));
		} else {
			this.once("load", (assets) => {
				done.call(scope, assets);
			});
		}
	}
	// called when all assets are loaded
	_loadingComplete() {
		if (this._loaded) return;
		this._loaded = true;
		this._registry.off("load", this._onLoad, this);
		this._registry.off("error", this._onError, this);
		if (this._failed.length) {
			if (this._callback) {
				this._callback.call(this._scope, "Failed to load some assets", this._failed);
			}
			this.fire("error", this._failed);
		} else {
			if (this._callback) {
				this._callback.call(this._scope);
			}
			this.fire("load", Array.from(this._assets));
		}
	}
	// called when an (any) asset is loaded
	_onLoad(asset) {
		if (this._loadingAssets.has(asset)) {
			this.fire("progress", asset);
			this._loadingAssets.delete(asset);
		}
		if (this._loadingAssets.size === 0) {
			setTimeout(() => {
				this._loadingComplete();
			}, 0);
		}
	}
	// called when an asset fails to load
	_onError(err, asset) {
		if (this._loadingAssets.has(asset)) {
			this._failed.push(asset);
			this._loadingAssets.delete(asset);
		}
		if (this._loadingAssets.size === 0) {
			setTimeout(() => {
				this._loadingComplete();
			}, 0);
		}
	}
	// called when a expected asset is added to the asset registry
	_onAddAsset(asset) {
		this._waitingAssets.delete(asset);
		this._assets.add(asset);
		if (!asset.loaded) {
			this._loadingAssets.add(asset);
			this._registry.load(asset);
		}
	}
	_waitForAsset(assetId) {
		this._waitingAssets.add(assetId);
		this._registry.once(`add:${assetId}`, this._onAddAsset, this);
	}
}
export {
	AssetListLoader
};
