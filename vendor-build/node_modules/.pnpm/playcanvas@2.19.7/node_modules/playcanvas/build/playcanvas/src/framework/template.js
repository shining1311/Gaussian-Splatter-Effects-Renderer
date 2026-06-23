import { SceneParser } from "./parsers/scene.js";
class Template {
	_app;
	_data;
	_templateRoot = null;
	constructor(app, data) {
		this._app = app;
		this._data = data;
	}
	instantiate() {
		if (!this._templateRoot) {
			this._parseTemplate();
		}
		return this._templateRoot.clone();
	}
	_parseTemplate() {
		const parser = new SceneParser(this._app, true);
		this._templateRoot = parser.parse(this._data);
	}
	set data(value) {
		this._data = value;
		this._templateRoot = null;
	}
	get data() {
		return this._data;
	}
}
export {
	Template
};
