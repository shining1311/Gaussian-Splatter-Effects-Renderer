/**
 * @import { GSplatPlacement } from './gsplat-placement.js'
 */
/**
 * Tracks placement state changes for a GSplatManager.
 * Detects changes in format version, modifier hash, numSplats, and centersVersion.
 *
 * @ignore
 */
export class GSplatPlacementStateTracker {
    /**
     * WeakMap of placement to last seen state.
     * Using WeakMap allows automatic cleanup when placements are garbage collected.
     *
     * @type {WeakMap<GSplatPlacement, { formatVersion: number, modifierHash: number, numSplats: number, centersVersion: number }>}
     * @private
     */
    private _states;
    /**
     * Checks if any placements have changed state. Updates internal tracking.
     *
     * @param {Iterable<GSplatPlacement>} placements - Iterable of placements to check.
     * @returns {boolean} True if any placement's state changed.
     */
    hasChanges(placements: Iterable<GSplatPlacement>): boolean;
}
import type { GSplatPlacement } from './gsplat-placement.js';
