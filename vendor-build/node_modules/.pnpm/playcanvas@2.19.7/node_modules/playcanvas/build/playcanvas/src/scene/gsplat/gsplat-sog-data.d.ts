export class GSplatSogData {
    static calcBands(centroidsWidth: any): any;
    meta: any;
    numSplats: any;
    means_l: any;
    means_u: any;
    quats: any;
    scales: any;
    sh0: any;
    sh_centroids: any;
    sh_labels: any;
    /**
     * V2-only codebook LUT (256x1 RGBA32F): .r = scales, .g = sh0, .b = shN, .a unused.
     * Built from meta codebooks in prepareCodebook(). Null for V1 assets.
     *
     * @type {Texture|null}
     */
    codebookTexture: Texture | null;
    /**
     * URL of the asset, used for debugging texture names.
     */
    url: string;
    /**
     * Cached centers array (x, y, z per splat), length = numSplats * 3.
     *
     * @type {Float32Array | null}
     * @private
     */
    private _centers;
    destroyed: boolean;
    /**
     * Number of spherical harmonics bands.
     */
    shBands: number;
    _destroyGpuResources(): void;
    destroy(): void;
    createIter(p: any, r: any, s: any, c: any, sh: any): GSplatSogIterator;
    calcAabb(result: any): void;
    getCenters(): Float32Array<ArrayBufferLike>;
    calcFocalPoint(result: any, pred: any): void;
    get isSog(): boolean;
    decompress(): Promise<GSplatData>;
    generateCenters(): Promise<void>;
    /**
     * Creates the V2 codebook LUT texture. Packs the three 256-entry scalar codebooks
     * (scales, sh0, shN) into a single 256x1 RGBA32F texture:
     * - .r = scales codebook
     * - .g = sh0 codebook
     * - .b = shN codebook
     * - .a = 0 (unused)
     *
     * @private
     */
    private _createCodebookTexture;
    /**
     * Patches any null-leading codebook entries in place. A null `codebook[0]` was a bug in
     * older SOG creation tools (since fixed); this workaround keeps already-published assets
     * in the wild renderable by synthesizing a plausible value so downstream sampling never
     * produces NaN. Required for both GPU rendering and CPU decompression flows.
     *
     * @private
     */
    private _patchCodebooks;
    /**
     * Synchronous codebook preparation. Patches any null-leading codebook entries and, for V2
     * assets, builds the codebook LUT texture. Must be called before {@link prepareGpuData}.
     */
    prepareCodebook(): void;
    prepareGpuData(): Promise<void>;
}
import { Texture } from '../../platform/graphics/texture.js';
declare class GSplatSogIterator {
    constructor(data: any, p: any, r: any, s: any, c: any, sh: any);
    read: (i: any) => void;
}
import { GSplatData } from './gsplat-data.js';
export {};
