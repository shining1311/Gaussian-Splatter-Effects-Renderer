import { ScopeId } from "./scope-id.js";
class ScopeSpace {
	constructor(name) {
		this.name = name;
		this.variables = /* @__PURE__ */ new Map();
	}
	resolve(name) {
		if (!this.variables.has(name)) {
			this.variables.set(name, new ScopeId(name));
		}
		return this.variables.get(name);
	}
	removeValue(value) {
		for (const uniform of this.variables.values()) {
			if (uniform.value === value) {
				uniform.value = null;
			}
		}
	}
}
export {
	ScopeSpace
};
