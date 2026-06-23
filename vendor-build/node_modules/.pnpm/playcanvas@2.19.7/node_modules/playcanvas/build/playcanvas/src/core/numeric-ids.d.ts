/**
 * A sequential numeric ID generator. Each instance maintains its own independent counter,
 * allowing separate ID spaces for different purposes.
 *
 * @ignore
 */
export class NumericIds {
    /** @type {number} */
    _counter: number;
    /**
     * Get the next unique ID.
     *
     * @returns {number} A unique sequential ID.
     */
    get(): number;
}
