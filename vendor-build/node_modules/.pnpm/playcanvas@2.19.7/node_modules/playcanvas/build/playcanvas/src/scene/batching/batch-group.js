import { LAYERID_WORLD } from "../constants.js";
class BatchGroup {
	_ui = false;
	_sprite = false;
	_obj = {
		model: [],
		element: [],
		sprite: [],
		render: []
	};
	id;
	name;
	dynamic;
	maxAabbSize;
	layers;
	constructor(id, name, dynamic, maxAabbSize, layers = [LAYERID_WORLD]) {
		this.id = id;
		this.name = name;
		this.dynamic = dynamic;
		this.maxAabbSize = maxAabbSize;
		this.layers = layers;
	}
	static MODEL = "model";
	static ELEMENT = "element";
	static SPRITE = "sprite";
	static RENDER = "render";
}
export {
	BatchGroup
};
