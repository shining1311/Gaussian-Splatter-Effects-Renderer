class StringIds {
	map = /* @__PURE__ */ new Map();
	id = 0;
	get(name) {
		let value = this.map.get(name);
		if (value === void 0) {
			value = this.id++;
			this.map.set(name, value);
		}
		return value;
	}
}
export {
	StringIds
};
