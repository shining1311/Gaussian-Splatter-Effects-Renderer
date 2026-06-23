/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { StorageBuffer } from '../../platform/graphics/storage-buffer.js'
 * @import { Texture } from '../../platform/graphics/texture.js'
 */
export class GSplatSorter extends EventHandler {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {import('../scene.js').Scene} [scene] - The scene to fire sort timing events on.
     */
    constructor(device: GraphicsDevice, scene?: import("../scene.js").Scene);
    worker: Worker;
    /** @type {Texture|StorageBuffer} */
    target: Texture | StorageBuffer;
    /** @type {ArrayBuffer} */
    orderData: ArrayBuffer;
    centers: any;
    scene: import("../scene.js").Scene;
    /** @type {UploadStream} */
    uploadStream: UploadStream;
    /**
     * Pending sorted result from the worker, applied on the next applyPendingSorted() call.
     * When multiple results arrive between frames, only the latest is kept.
     *
     * @type {{ count: number, data: Uint32Array }|null}
     */
    pendingSorted: {
        count: number;
        data: Uint32Array;
    } | null;
    destroy(): void;
    /**
     * @param {Texture|StorageBuffer} target - The GPU target for order data uploads.
     * @param {number} numSplats - The number of splats.
     * @param {Float32Array} centers - The splat center positions.
     * @param {Uint32Array} [chunks] - Optional chunk data.
     */
    init(target: Texture | StorageBuffer, numSplats: number, centers: Float32Array, chunks?: Uint32Array): void;
    /**
     * Applies the most recent pending sorted result (if any), uploading order data to the GPU.
     * Call once per frame from the instance's update().
     *
     * @returns {number} The splat count from the applied result, or -1 if nothing was pending.
     */
    applyPendingSorted(): number;
    setMapping(mapping: any): void;
    setCamera(pos: any, dir: any): void;
}
import { EventHandler } from '../../core/event-handler.js';
import type { Texture } from '../../platform/graphics/texture.js';
import type { StorageBuffer } from '../../platform/graphics/storage-buffer.js';
import { UploadStream } from '../../platform/graphics/upload-stream.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
