import { BoundingBox } from "../../core/shape/bounding-box.js";
import { Vec3 } from "../../core/math/vec3.js";
import { Vec4 } from "../../core/math/vec4.js";
const tmpMin = new Vec3();
const tmpMax = new Vec3();
class GSplatOctreeNode {
	lods;
	bounds = new BoundingBox();
	boundingSphere = new Vec4();
	constructor(lods, boundData) {
		this.lods = lods;
		tmpMin.set(boundData.min[0], boundData.min[1], boundData.min[2]);
		tmpMax.set(boundData.max[0], boundData.max[1], boundData.max[2]);
		this.bounds.setMinMax(tmpMin, tmpMax);
		const center = this.bounds.center;
		const he = this.bounds.halfExtents;
		const radius = Math.sqrt(he.x * he.x + he.y * he.y + he.z * he.z);
		this.boundingSphere.set(center.x, center.y, center.z, radius);
	}
}
export {
	GSplatOctreeNode
};
