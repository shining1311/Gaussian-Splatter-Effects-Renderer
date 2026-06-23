import { EventHandler } from "../../core/event-handler.js";
class Bundle extends EventHandler {
	_index = /* @__PURE__ */ new Map();
	_loaded = false;
	static EVENT_ADD = "add";
	static EVENT_LOAD = "load";
	addFile(url, data) {
		if (this._index.has(url)) {
			return;
		}
		this._index.set(url, data);
		this.fire("add", url, data);
	}
	has(url) {
		return this._index.has(url);
	}
	get(url) {
		return this._index.get(url) || null;
	}
	destroy() {
		this._index.clear();
	}
	set loaded(value) {
		if (!value || this._loaded) {
			return;
		}
		this._loaded = true;
		this.fire("load");
	}
	get loaded() {
		return this._loaded;
	}
}
export {
	Bundle
};
