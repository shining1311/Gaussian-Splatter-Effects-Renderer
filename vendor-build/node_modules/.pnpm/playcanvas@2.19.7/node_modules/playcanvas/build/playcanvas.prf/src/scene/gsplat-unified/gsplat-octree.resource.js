import { Vec3 } from "../../core/math/vec3.js";
import { BoundingBox } from "../../core/shape/bounding-box.js";
import { GSplatOctree } from "./gsplat-octree.js";
class GSplatOctreeResource {
	aabb = new BoundingBox();
	centersVersion = 0;
	octree;
	_numSplats = null;
	data;
	constructor(assetFileUrl, data, assetLoader) {
		this.octree = new GSplatOctree(assetFileUrl, data);
		this.octree.assetLoader = assetLoader;
		this.aabb.setMinMax(new Vec3(data.tree.bound.min), new Vec3(data.tree.bound.max));
		this.data = data;
		this.data.tree = null;
	}
	get numSplats() {
		if (this._numSplats === null) {
			let total = 0;
			const nodes = this.octree?.nodes ?? [];
			for (let i = 0; i < nodes.length; i++) {
				total += nodes[i].lods[0]?.count ?? 0;
			}
			this._numSplats = total;
		}
		return this._numSplats;
	}
	destroy() {
		this.octree?.destroy();
		this.octree = null;
	}
}
export {
	GSplatOctreeResource
};
