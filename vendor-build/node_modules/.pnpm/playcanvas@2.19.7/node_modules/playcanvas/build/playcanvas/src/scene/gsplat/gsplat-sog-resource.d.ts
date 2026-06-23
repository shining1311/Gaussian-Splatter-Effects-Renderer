/**
 * @import { GSplatSogData } from './gsplat-sog-data.js'
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 */
export class GSplatSogResource extends GSplatResourceBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatSogData} gsplatData - The splat data.
     * @param {object} [options] - Passed to {@link GSplatResourceBase} constructor.
     */
    constructor(device: GraphicsDevice, gsplatData: GSplatSogData, options?: object);
    /**
     * Opts each of the owned source textures into releasing its CPU-side ImageBitmap after
     * upload. Called by the gsplat octree, which re-creates these resources from scratch on
     * device loss and therefore does not need the CPU source retained for re-upload.
     *
     * @ignore
     */
    releaseTextureSources(): void;
    /**
     * Populates the parameters map with dequantization uniforms.
     * V1 needs per-axis/component min/max ranges. V2 derives everything from the codebook LUT
     * texture so only the means min/max are required.
     *
     * @private
     */
    private _populateParameters;
    configureMaterialDefines(defines: any): void;
}
import { GSplatResourceBase } from './gsplat-resource-base.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { GSplatSogData } from './gsplat-sog-data.js';
