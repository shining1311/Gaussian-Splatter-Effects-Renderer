/** @ignore */
export class GSplatResource extends GSplatResourceBase {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatData} gsplatData - The splat data.
     * @param {object} [options] - Passed to {@link GSplatResourceBase} constructor.
     */
    constructor(device: GraphicsDevice, gsplatData: GSplatData, options?: object);
    /** @type {0 | 1 | 2 | 3} */
    shBands: 0 | 1 | 2 | 3;
    configureMaterialDefines(defines: any): void;
    /**
     * Updates pixel data of splatColor texture based on the supplied color components and opacity.
     * Assumes that the texture is using an RGBA format where RGB are color components influenced
     * by SH spherical harmonics and A is opacity after a sigmoid transformation.
     *
     * @param {GSplatData} gsplatData - The source data
     */
    updateColorData(gsplatData: GSplatData): void;
    /**
     * @param {GSplatData} gsplatData - The source data
     */
    updateTransformData(gsplatData: GSplatData): void;
    /**
     * @param {GSplatData} gsplatData - The source data
     */
    updateSHData(gsplatData: GSplatData): void;
}
import { GSplatResourceBase } from './gsplat-resource-base.js';
import type { GSplatData } from './gsplat-data.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
