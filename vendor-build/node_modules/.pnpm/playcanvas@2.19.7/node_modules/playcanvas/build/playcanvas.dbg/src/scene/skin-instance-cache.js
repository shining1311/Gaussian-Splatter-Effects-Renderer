var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { RefCountedObject } from "../core/ref-counted-object.js";
import { SkinInstance } from "./skin-instance.js";
class SkinInstanceCachedObject extends RefCountedObject {
  constructor(skin, skinInstance) {
    super();
    this.skin = skin;
    this.skinInstance = skinInstance;
  }
}
const _SkinInstanceCache = class _SkinInstanceCache {
  // function that logs out the state of the skin instances cache
  static logCachedSkinInstances() {
    console.log("CachedSkinInstances");
    _SkinInstanceCache._skinInstanceCache.forEach((array, rootBone) => {
      console.log(`${rootBone.name}: Array(${array.length})`);
      for (let i = 0; i < array.length; i++) {
        console.log(`  ${i}: RefCount ${array[i].refCount}`);
      }
    });
  }
  // returns cached or creates a skin instance for the skin and a rootBone, to be used by render component
  // on the specified entity
  static createCachedSkinInstance(skin, rootBone, entity) {
    let skinInst = _SkinInstanceCache.getCachedSkinInstance(skin, rootBone);
    if (!skinInst) {
      skinInst = new SkinInstance(skin);
      skinInst.resolve(rootBone, entity);
      _SkinInstanceCache.addCachedSkinInstance(skin, rootBone, skinInst);
    }
    return skinInst;
  }
  // returns already created skin instance from skin, for use on the rootBone
  // ref count of existing skinInstance is increased
  static getCachedSkinInstance(skin, rootBone) {
    let skinInstance = null;
    const cachedObjArray = _SkinInstanceCache._skinInstanceCache.get(rootBone);
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
    let cachedObjArray = _SkinInstanceCache._skinInstanceCache.get(rootBone);
    if (!cachedObjArray) {
      cachedObjArray = [];
      _SkinInstanceCache._skinInstanceCache.set(rootBone, cachedObjArray);
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
        const cachedObjArray = _SkinInstanceCache._skinInstanceCache.get(rootBone);
        if (cachedObjArray) {
          const cachedObjIndex = cachedObjArray.findIndex((element) => element.skinInstance === skinInstance);
          if (cachedObjIndex >= 0) {
            const cachedObj = cachedObjArray[cachedObjIndex];
            cachedObj.decRefCount();
            if (cachedObj.refCount === 0) {
              cachedObjArray.splice(cachedObjIndex, 1);
              if (!cachedObjArray.length) {
                _SkinInstanceCache._skinInstanceCache.delete(rootBone);
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
};
// map of SkinInstances allowing those to be shared between
// (specifically a single glb with multiple render components)
// It maps a rootBone to an array of SkinInstanceCachedObject
// this allows us to find if a skin instance already exists for a rootbone, and a specific skin
__publicField(_SkinInstanceCache, "_skinInstanceCache", /* @__PURE__ */ new Map());
let SkinInstanceCache = _SkinInstanceCache;
export {
  SkinInstanceCache
};
