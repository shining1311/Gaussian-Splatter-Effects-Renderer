export class GSplatOctreeResource {
    /**
     * @param {string} assetFileUrl - The file URL of the container asset.
     * @param {object} data - Parsed JSON data.
     * @param {object} assetLoader - Asset loader instance (framework-level object).
     */
    constructor(assetFileUrl: string, data: object, assetLoader: object);
    /** @type {BoundingBox} */
    aabb: BoundingBox;
    /**
     * Version counter for centers array changes. Always 0 for octree resources (static).
     *
     * @ignore
     */
    centersVersion: number;
    /** @type {GSplatOctree|null} */
    octree: GSplatOctree | null;
    /**
     * Cached total splat count at full detail (LOD 0). Lazily computed by {@link numSplats}.
     *
     * @type {number|null}
     * @private
     */
    private _numSplats;
    /**
     * Raw parsed manifest data, retained for consumers that read custom or extension
     * fields the octree itself does not consume (for example application-specific
     * metadata accompanying a `lod-meta.json`). The `tree` field is nulled out by the
     * constructor since {@link GSplatOctree} consumes it — access node hierarchy via
     * {@link GSplatOctreeResource#octree} instead.
     *
     * @type {object}
     */
    data: object;
    /**
     * Total number of splats across all leaf nodes at the highest LOD (LOD 0) — the full-detail
     * splat count of the captured scene. Not all of these are resident at runtime: the LOD
     * streaming system selects a subset per node based on view distance and the configured
     * splat budget.
     *
     * @type {number}
     */
    get numSplats(): number;
    /**
     * Destroys the octree resource and cleans up all associated resources.
     */
    destroy(): void;
}
import { BoundingBox } from '../../core/shape/bounding-box.js';
import { GSplatOctree } from './gsplat-octree.js';
