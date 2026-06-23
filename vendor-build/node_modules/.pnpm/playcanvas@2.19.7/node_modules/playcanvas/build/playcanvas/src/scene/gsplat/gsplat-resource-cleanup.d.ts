/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { GSplatResourceBase } from './gsplat-resource-base.js'
 */
/**
 * Manages deferred destruction of GSplat resources. When a resource is destroyed while
 * still in use (refCount > 0), it is queued here and destroyed later when safe.
 *
 * @ignore
 */
export class GSplatResourceCleanup {
    /** @type {DeviceCache} */
    static _cache: DeviceCache;
    /**
     * Queue a resource for deferred destruction.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatResourceBase} resource - The resource to destroy later.
     */
    static queueDestroy(device: GraphicsDevice, resource: GSplatResourceBase): void;
    /**
     * Process pending resource destructions for a device. Called by GSplatDirector.update().
     *
     * @param {GraphicsDevice} device - The graphics device.
     */
    static process(device: GraphicsDevice): void;
    /** @type {Set<GSplatResourceBase>} */
    _pendingDestroy: Set<GSplatResourceBase>;
    /**
     * Called by DeviceCache when device is destroyed.
     * Just releases references - GPU resources are already gone.
     */
    destroy(): void;
}
import type { GSplatResourceBase } from './gsplat-resource-base.js';
import { DeviceCache } from '../../platform/graphics/device-cache.js';
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
