var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { BoundingBox } from "../../core/shape/bounding-box.js";
import { Vec3 } from "../../core/math/vec3.js";
import { Vec4 } from "../../core/math/vec4.js";
const tmpMin = new Vec3();
const tmpMax = new Vec3();
class GSplatOctreeNode {
  /**
   * @param {GSplatOctreeNodeLod[]} lods - The LOD data for this node
   * @param {Object} [boundData] - The bounding box data with min and max arrays
   */
  constructor(lods, boundData) {
    /**
     * @type {GSplatOctreeNodeLod[]}
     */
    __publicField(this, "lods");
    /**
     * The axis-aligned bounding box of this octree node in local space.
     */
    __publicField(this, "bounds", new BoundingBox());
    /**
     * Precomputed bounding sphere derived from the AABB. Stored as (center.x, center.y,
     * center.z, radius) for efficient GPU frustum culling.
     */
    __publicField(this, "boundingSphere", new Vec4());
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
