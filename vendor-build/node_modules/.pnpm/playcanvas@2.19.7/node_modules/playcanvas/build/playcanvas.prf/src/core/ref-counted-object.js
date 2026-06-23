class RefCountedObject {
	_refCount = 0;
	incRefCount() {
		this._refCount++;
	}
	decRefCount() {
		this._refCount--;
	}
	get refCount() {
		return this._refCount;
	}
}
export {
	RefCountedObject
};
