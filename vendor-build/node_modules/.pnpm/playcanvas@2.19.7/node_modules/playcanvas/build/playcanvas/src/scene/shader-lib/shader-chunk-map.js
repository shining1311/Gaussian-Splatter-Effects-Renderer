import { hashCode } from "../../core/hash.js";
class ShaderChunkMap extends Map {
	_validations;
	_keyDirty = false;
	_key = "";
	constructor(validations) {
		super();
		this._validations = validations;
	}
	set(name, code) {
		if (!this.has(name) || this.get(name) !== code) {
			this.markDirty();
		}
		return super.set(name, code);
	}
	add(object, override = true) {
		for (const [key, value] of Object.entries(object)) {
			if (override || !this.has(key)) {
				this.set(key, value);
			}
		}
		return this;
	}
	delete(name) {
		const existed = this.has(name);
		const result = super.delete(name);
		if (existed && result) {
			this.markDirty();
		}
		return result;
	}
	clear() {
		if (this.size > 0) {
			this.markDirty();
		}
		super.clear();
	}
	markDirty() {
		this._dirty = true;
		this._keyDirty = true;
	}
	isDirty() {
		return this._dirty;
	}
	resetDirty() {
		this._dirty = false;
	}
	get key() {
		if (this._keyDirty) {
			this._keyDirty = false;
			this._key = Array.from(this.entries()).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${k}=${hashCode(v)}`).join(",");
		}
		return this._key;
	}
	copy(source) {
		for (const key of this.keys()) {
			if (!source.has(key)) {
				this.delete(key);
			}
		}
		for (const [key, value] of source) {
			this.set(key, value);
		}
		return this;
	}
}
export {
	ShaderChunkMap
};
