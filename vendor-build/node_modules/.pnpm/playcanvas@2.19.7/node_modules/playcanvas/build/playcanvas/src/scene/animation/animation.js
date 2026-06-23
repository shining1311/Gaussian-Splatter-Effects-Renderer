class AnimationKey {
	constructor(time, position, rotation, scale) {
		this.time = time;
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
	}
}
class AnimationNode {
	constructor() {
		this._name = "";
		this._keys = [];
	}
}
class Animation {
	name = "";
	duration = 0;
	constructor() {
		this._nodes = [];
		this._nodeDict = {};
	}
	getNode(name) {
		return this._nodeDict[name];
	}
	addNode(node) {
		this._nodes.push(node);
		this._nodeDict[node._name] = node;
	}
	get nodes() {
		return this._nodes;
	}
}
export {
	Animation,
	AnimationKey,
	AnimationNode
};
