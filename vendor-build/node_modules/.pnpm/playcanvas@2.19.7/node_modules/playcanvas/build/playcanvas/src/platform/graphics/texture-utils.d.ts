/**
 * @import { Vec2 } from '../../core/math/vec2.js'
 */
/**
 * A class providing utility functions for textures.
 *
 * @ignore
 */
export class TextureUtils {
    /**
     * Calculate the dimension of a texture at a specific mip level.
     *
     * @param {number} dimension - Texture dimension at level 0.
     * @param {number} mipLevel - Mip level.
     * @returns {number} The dimension of the texture at the specified mip level.
     */
    static calcLevelDimension(dimension: number, mipLevel: number): number;
    /**
     * Calculate the number of mip levels for a texture with the specified dimensions.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} [depth] - Texture's depth. Defaults to 1.
     * @returns {number} The number of mip levels required for the texture.
     */
    static calcMipLevelsCount(width: number, height: number, depth?: number): number;
    /**
     * Calculate the size in bytes of the texture level given its format and dimensions.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} depth - Texture's depth.
     * @param {number} format - Texture's pixel format PIXELFORMAT_***.
     * @returns {number} The number of bytes of GPU memory required for the texture.
     */
    static calcLevelGpuSize(width: number, height: number, depth: number, format: number): number;
    /**
     * Calculate the GPU memory required for a texture.
     *
     * @param {number} width - Texture's width.
     * @param {number} height - Texture's height.
     * @param {number} depth - Texture's depth.
     * @param {number} format - Texture's pixel format PIXELFORMAT_***.
     * @param {boolean} mipmaps - True if the texture includes mipmaps, false otherwise.
     * @param {boolean} cubemap - True is the texture is a cubemap, false otherwise.
     * @returns {number} The number of bytes of GPU memory required for the texture.
     */
    static calcGpuSize(width: number, height: number, depth: number, format: number, mipmaps: boolean, cubemap: boolean): number;
    /**
     * Calculate roughly square texture dimensions that can hold the given number of texels.
     *
     * @param {number} count - The number of texels to fit.
     * @param {Vec2} result - Output vector to receive width (x) and height (y).
     * @param {number} [widthMultiple] - If greater than 1, the width is rounded up to the
     * nearest multiple of this value. Useful for ensuring rows align to a specific stride (e.g.
     * 4 texels per matrix row, or N lights per cell).
     * @returns {Vec2} The result vector with dimensions set.
     */
    static calcTextureSize(count: number, result: Vec2, widthMultiple?: number): Vec2;
}
import type { Vec2 } from '../../core/math/vec2.js';
