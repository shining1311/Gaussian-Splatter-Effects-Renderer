/**
 * Dual gesture input source.
 */
export type DualGestureSourceDeltas = {
    /**
     * - The left input deltas.
     */
    leftInput: number[];
    /**
     * - The right input deltas.
     */
    rightInput: number[];
    /**
     * - The double tap delta.
     */
    doubleTap: number[];
};
/**
 * Dual gesture input source.
 *
 * @category Input Source
 * @alpha
 *
 * @typedef {object} DualGestureSourceDeltas
 * @property {number[]} leftInput - The left input deltas.
 * @property {number[]} rightInput - The right input deltas.
 * @property {number[]} doubleTap - The double tap delta.
 * @augments {InputSource<DualGestureSourceDeltas>}
 */
export class DualGestureSource extends InputSource<DualGestureSourceDeltas> {
    /**
     * @param {`${'joystick' | 'touch'}-${'joystick' | 'touch'}`} [layout] - The layout of the dual
     * gesture source.
     */
    constructor(layout?: `${"joystick" | "touch"}-${"joystick" | "touch"}`);
    /**
     * @type {ReturnType<typeof movementState>}
     * @private
     */
    private _movementState;
    /**
     * @type {`${'joystick' | 'touch'}-${'joystick' | 'touch'}`}
     * @private
     */
    private _layout;
    /**
     * @type {Map<number, { x: number, y: number, left: boolean }>}
     * @private
     */
    private _pointerData;
    /**
     * @type {{ x: number, y: number, time: number }}
     * @private
     */
    private _lastPointer;
    /**
     * @type {VirtualJoystick}
     * @private
     */
    private _leftJoystick;
    /**
     * @type {VirtualJoystick}
     * @private
     */
    private _rightJoystick;
    /**
     * Sets the layout of the dual gesture input source. The value is a hyphen-separated pair
     * describing the left and right inputs respectively, where each side can be either
     * `joystick` (a virtual joystick) or `touch` (a touch). Defaults to `joystick-touch`.
     *
     * @type {`${'joystick' | 'touch'}-${'joystick' | 'touch'}`}
     */
    set layout(value: `${"joystick" | "touch"}-${"joystick" | "touch"}`);
    /**
     * Gets the layout of the dual gesture input source.
     *
     * @type {`${'joystick' | 'touch'}-${'joystick' | 'touch'}`}
     */
    get layout(): `${"joystick" | "touch"}-${"joystick" | "touch"}`;
    /**
     * @private
     * @param {PointerEvent} event - The pointer event.
     */
    private _onPointerDown;
    /**
     * @param {PointerEvent} event - The pointer event.
     * @private
     */
    private _onPointerMove;
    /**
     * @param {PointerEvent} event - The pointer event.
     * @private
     */
    private _onPointerUp;
    get leftJoystick(): VirtualJoystick;
    get rightJoystick(): VirtualJoystick;
}
import { InputSource } from '../input.js';
import { VirtualJoystick } from './virtual-joystick.js';
