class NumericIds {
	_counter = 0;
	get() {
		return this._counter++;
	}
}
export {
	NumericIds
};
