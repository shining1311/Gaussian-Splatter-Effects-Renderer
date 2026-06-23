import { RefCountedCache } from "../../core/ref-counted-cache.js";
class LightmapCache {
	static cache = new RefCountedCache();
	// add texture reference to lightmap cache
	static incRef(texture) {
		this.cache.incRef(texture);
	}
	// remove texture reference from lightmap cache
	static decRef(texture) {
		this.cache.decRef(texture);
	}
	static destroy() {
		this.cache.destroy();
	}
}
export {
	LightmapCache
};
