class SceneRegistryItem {
	name;
	url;
	data = null;
	_loading = false;
	_onLoadedCallbacks = [];
	constructor(name, url) {
		this.name = name;
		this.url = url;
	}
	get loaded() {
		return !!this.data;
	}
	get loading() {
		return this._loading;
	}
}
export {
	SceneRegistryItem
};
