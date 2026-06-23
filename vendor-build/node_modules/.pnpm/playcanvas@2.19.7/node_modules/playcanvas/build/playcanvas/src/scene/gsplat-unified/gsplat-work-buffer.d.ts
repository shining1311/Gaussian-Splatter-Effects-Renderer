/** @ignore */
export class GSplatWorkBuffer {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatFormat} format - The work buffer format descriptor.
     */
    constructor(device: GraphicsDevice, format: GSplatFormat);
    /** @type {GraphicsDevice} */
    device: GraphicsDevice;
    /** @type {GSplatFormat} */
    format: GSplatFormat;
    /** @type {number} */
    id: number;
    /**
     * Manages textures for format streams.
     *
     * @type {GSplatStreams}
     */
    streams: GSplatStreams;
    /**
     * Main MRT render target for all work buffer streams.
     *
     * @type {RenderTarget}
     */
    renderTarget: RenderTarget;
    /**
     * Color-only render target for updating just the dataColor stream.
     *
     * @type {RenderTarget}
     */
    colorRenderTarget: RenderTarget;
    /** @type {Texture|undefined} */
    orderTexture: Texture | undefined;
    /** @type {StorageBuffer|undefined} */
    orderBuffer: StorageBuffer | undefined;
    /** @type {UploadStream} */
    uploadStream: UploadStream;
    /** @type {GSplatWorkBufferRenderPass} */
    renderPass: GSplatWorkBufferRenderPass;
    /** @type {GSplatWorkBufferRenderPass} */
    colorRenderPass: GSplatWorkBufferRenderPass;
    /**
     * GPU frustum culler for octree node visibility.
     *
     * @type {GSplatFrustumCuller}
     */
    frustumCuller: GSplatFrustumCuller;
    /**
     * Creates or recreates render targets from current textures.
     *
     * @private
     */
    private _createRenderTargets;
    /**
     * Syncs textures and render targets with the format when extra streams are added.
     * Call this before rendering to ensure all streams have textures.
     */
    syncWithFormat(): void;
    /**
     * Gets a texture by name.
     *
     * @param {string} name - The texture name.
     * @returns {Texture|undefined} The texture, or undefined if not found.
     */
    getTexture(name: string): Texture | undefined;
    destroy(): void;
    get textureSize(): number;
    setOrderData(data: any): void;
    /**
     * @param {number} textureSize - The texture size to resize to.
     */
    resize(textureSize: number): void;
    /**
     * Render given splats to the work buffer.
     *
     * @param {GSplatInfo[]} splats - The splats to render.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {number[][]|undefined} colorsByLod - Array of RGB colors per LOD. Index by lodIndex; if a
     * shorter array is provided, index 0 will be reused as fallback.
     * @param {Set<number>|null} [changedAllocIds] - When provided, only render sub-draws for intervals
     * whose allocIds are in this set (per-node partial update).
     */
    render(splats: GSplatInfo[], cameraNode: GraphNode, colorsByLod: number[][] | undefined, changedAllocIds?: Set<number> | null): void;
    /**
     * Render only the color data to the work buffer (not geometry/covariance).
     *
     * @param {GSplatInfo[]} splats - The splats to render.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {number[][]|undefined} colorsByLod - Array of RGB colors per LOD. Index by lodIndex; if a
     * shorter array is provided, index 0 will be reused as fallback.
     * @param {Set<number>|null} [changedAllocIds] - Set of changed allocIds for partial render.
     */
    renderColor(splats: GSplatInfo[], cameraNode: GraphNode, colorsByLod: number[][] | undefined, changedAllocIds?: Set<number> | null): void;
}
/**
 * @import { GSplatFormat } from '../gsplat/gsplat-format.js'
 * @import { GSplatInfo } from "./gsplat-info.js"
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { GraphNode } from '../graph-node.js';
 * @import { ShaderMaterial } from '../materials/shader-material.js'
 */
/**
 * A helper class to cache quad renders for work buffer rendering.
 *
 * @ignore
 */
export class WorkBufferRenderInfo {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {string} key - Cache key for this render info.
     * @param {ShaderMaterial} material - The material to use.
     * @param {boolean} colorOnly - Whether to render only color (not full MRT).
     * @param {GSplatFormat} format - The work buffer format descriptor.
     */
    constructor(device: GraphicsDevice, key: string, material: ShaderMaterial, colorOnly: boolean, format: GSplatFormat);
    /** @type {ShaderMaterial} */
    material: ShaderMaterial;
    /** @type {QuadRender} */
    quadRender: QuadRender;
    destroy(): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { GSplatFormat } from '../gsplat/gsplat-format.js';
import { GSplatStreams } from '../gsplat/gsplat-streams.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
import { Texture } from '../../platform/graphics/texture.js';
import { StorageBuffer } from '../../platform/graphics/storage-buffer.js';
import { UploadStream } from '../../platform/graphics/upload-stream.js';
import { GSplatWorkBufferRenderPass } from './gsplat-work-buffer-render-pass.js';
import { GSplatFrustumCuller } from './gsplat-frustum-culler.js';
import type { GSplatInfo } from "./gsplat-info.js";
import type { GraphNode } from '../graph-node.js';
import type { ShaderMaterial } from '../materials/shader-material.js';
import { QuadRender } from '../graphics/quad-render.js';
