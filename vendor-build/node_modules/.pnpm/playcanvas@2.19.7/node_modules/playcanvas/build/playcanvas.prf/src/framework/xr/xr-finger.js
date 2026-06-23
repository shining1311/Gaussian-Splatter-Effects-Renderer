class XrFinger {
	_index;
	_hand;
	_joints = [];
	_tip = null;
	constructor(index, hand) {
		this._index = index;
		this._hand = hand;
		this._hand._fingers.push(this);
	}
	get index() {
		return this._index;
	}
	get hand() {
		return this._hand;
	}
	get joints() {
		return this._joints;
	}
	get tip() {
		return this._tip;
	}
}
export {
	XrFinger
};
