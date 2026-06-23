/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { Texture } from '../../platform/graphics/texture.js'
 */
/**
 * Render pass implementation of a down-sample filter used by the Depth of Field pass. Based on
 * a texel of the CoC texture, it generates blurred version of the near or far texture.
 *
 * @category Graphics
 * @ignore
 */
export class RenderPassDofBlur extends RenderPassShaderQuad {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Texture|null} nearTexture - The near texture to blur. Skip near blur if the texture is null.
     * @param {Texture} farTexture - The far texture to blur.
     * @param {Texture} cocTexture - The CoC texture.
     */
    constructor(device: GraphicsDevice, nearTexture: Texture | null, farTexture: Texture, cocTexture: Texture);
    blurRadiusNear: number;
    blurRadiusFar: number;
    _blurRings: number;
    _blurRingPoints: number;
    /**
     * Resolution the blur radius is calibrated against. The blur is applied as a fraction of this
     * height, making the effect resolution-independent (higher resolution only increases quality,
     * not blur strength). Applied as a uniform scale on the blur radius, so it can be changed at
     * runtime without recompiling the shader. Value 540 matches the legacy half-resolution far
     * texture at a 1080p frame, preserving previously authored blurRadius values.
     *
     * @type {number}
     */
    referenceHeight: number;
    nearTexture: Texture;
    farTexture: Texture;
    cocTexture: Texture;
    kernelId: import("../../index.js").ScopeId;
    kernelCountId: import("../../index.js").ScopeId;
    blurRadiusNearId: import("../../index.js").ScopeId;
    blurRadiusFarId: import("../../index.js").ScopeId;
    nearTextureId: import("../../index.js").ScopeId;
    farTextureId: import("../../index.js").ScopeId;
    cocTextureId: import("../../index.js").ScopeId;
    set blurRings(value: number);
    get blurRings(): number;
    set blurRingPoints(value: number);
    get blurRingPoints(): number;
    createShader(): void;
    kernel: Float32Array<ArrayBuffer>;
}
import { RenderPassShaderQuad } from '../../scene/graphics/render-pass-shader-quad.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
