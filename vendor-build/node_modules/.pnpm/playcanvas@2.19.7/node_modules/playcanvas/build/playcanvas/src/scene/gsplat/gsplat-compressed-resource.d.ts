export class GSplatCompressedResource extends GSplatResourceBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatCompressedData} gsplatData - The splat data.
     * @param {object} [options] - Passed to {@link GSplatResourceBase} constructor.
     */
    constructor(device: GraphicsDevice, gsplatData: GSplatCompressedData, options?: object);
    chunks: Float32Array<ArrayBuffer>;
    configureMaterialDefines(defines: any): void;
    /**
     * Evaluates the texture size for chunk data.
     *
     * @param {number} numChunks - The number of chunks.
     * @returns {Vec2} The width and height of the texture.
     * @private
     */
    private evalChunkTextureSize;
}
import { GSplatResourceBase } from './gsplat-resource-base.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { GSplatCompressedData } from './gsplat-compressed-data.js';
