import {
  LIGHTTYPE_OMNI
} from "../constants.js";
import { ShadowMap } from "./shadow-map.js";
class ShadowMapCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  destroy() {
    this.clear();
    this.cache = null;
  }
  // remove all shadowmaps from the cache
  clear() {
    this.cache.forEach((shadowMaps) => {
      shadowMaps.forEach((shadowMap) => {
        shadowMap.destroy();
      });
    });
    this.cache.clear();
  }
  // generates a string key for the shadow map required by the light
  getKey(light) {
    const isCubeMap = light._type === LIGHTTYPE_OMNI;
    const shadowType = light._shadowType;
    const resolution = light._shadowResolution;
    return `${isCubeMap}-${shadowType}-${resolution}`;
  }
  // returns shadow map from the cache, or creates a new one if none available
  get(device, light) {
    const key = this.getKey(light);
    const shadowMaps = this.cache.get(key);
    if (shadowMaps && shadowMaps.length) {
      return shadowMaps.pop();
    }
    const shadowMap = ShadowMap.create(device, light);
    shadowMap.cached = true;
    return shadowMap;
  }
  // returns shadow map for the light back to the cache
  add(light, shadowMap) {
    const key = this.getKey(light);
    const shadowMaps = this.cache.get(key);
    if (shadowMaps) {
      shadowMaps.push(shadowMap);
    } else {
      this.cache.set(key, [shadowMap]);
    }
  }
}
export {
  ShadowMapCache
};
