import { RefCountedObject } from "../core/ref-counted-object.js";
import { SkinInstance } from "./skin-instance.js";
class SkinInstanceCachedObject extends RefCountedObject {
	constructor(skin, skinInstance) {
		super();
		this.skin = skin;
		this.skinInstance = skinInstance;
	}
}
class SkinInstanceCache {
	// map of SkinInstances allowing those to be shared between
	// (specifically a single glb with multiple render components)
	// It maps a rootBone to an array of SkinInstanceCachedObject
	// this allows us to find if a skin instance already exists for a rootbone, and a specific skin
	static _skinInstanceCache = /* @__PURE__ */ new Map();
	// returns cached or creates a skin instance for the skin and a rootBone, to be used by render component
	// on the specified entity
	static createCachedSkinInstance(skin, rootBone, entity) {
		let skinInst = SkinInstanceCache.getCachedSkinInstance(skin, rootBone);
		if (!skinInst) {
			skinInst = new SkinInstance(skin);
			skinInst.resolve(rootBone, entity);
			SkinInstanceCache.addCachedSkinInstance(skin, rootBone, skinInst);
		}
		return skinInst;
	}
	// returns already created skin instance from skin, for use on the rootBone
	// ref count of existing skinInstance is increased
	static getCachedSkinInstance(skin, rootBone) {
		let skinInstance = null;
		const cachedObjArray = SkinInstanceCache._skinInstanceCache.get(rootBone);
		if (cachedObjArray) {
			const cachedObj = cachedObjArray.find((element) => element.skin === skin);
			if (cachedObj) {
				cachedObj.incRefCount();
				skinInstance = cachedObj.skinInstance;
			}
		}
		return skinInstance;
	}
	// adds skin instance to the cache, and increases ref count on it
	static addCachedSkinInstance(skin, rootBone, skinInstance) {
		let cachedObjArray = SkinInstanceCache._skinInstanceCache.get(rootBone);
		if (!cachedObjArray) {
			cachedObjArray = [];
			SkinInstanceCache._skinInstanceCache.set(rootBone, cachedObjArray);
		}
		let cachedObj = cachedObjArray.find((element) => element.skin === skin);
		if (!cachedObj) {
			cachedObj = new SkinInstanceCachedObject(skin, skinInstance);
			cachedObjArray.push(cachedObj);
		}
		cachedObj.incRefCount();
	}
	// removes skin instance from the cache. This decreases ref count, and when that reaches 0 it gets destroyed
	static removeCachedSkinInstance(skinInstance) {
		if (skinInstance) {
			const rootBone = skinInstance.rootBone;
			if (rootBone) {
				const cachedObjArray = SkinInstanceCache._skinInstanceCache.get(rootBone);
				if (cachedObjArray) {
					const cachedObjIndex = cachedObjArray.findIndex((element) => element.skinInstance === skinInstance);
					if (cachedObjIndex >= 0) {
						const cachedObj = cachedObjArray[cachedObjIndex];
						cachedObj.decRefCount();
						if (cachedObj.refCount === 0) {
							cachedObjArray.splice(cachedObjIndex, 1);
							if (!cachedObjArray.length) {
								SkinInstanceCache._skinInstanceCache.delete(rootBone);
							}
							if (skinInstance) {
								skinInstance.destroy();
								cachedObj.skinInstance = null;
							}
						}
					}
				}
			}
		}
	}
}
export {
	SkinInstanceCache
};
