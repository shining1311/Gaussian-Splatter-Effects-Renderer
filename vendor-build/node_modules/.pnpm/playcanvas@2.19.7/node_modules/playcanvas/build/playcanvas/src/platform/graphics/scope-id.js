import { VersionedObject } from "./versioned-object.js";
class ScopeId {
	constructor(name) {
		this.name = name;
		this.value = null;
		this.versionObject = new VersionedObject();
	}
	// Don't stringify ScopeId to JSON by JSON.stringify, as this stores 'value'
	// which is not needed. This is used when stringifying a uniform buffer format, which
	// internally stores the scope.
	toJSON(key) {
		return void 0;
	}
	setValue(value) {
		this.value = value;
		this.versionObject.increment();
	}
	getValue() {
		return this.value;
	}
}
export {
	ScopeId
};
