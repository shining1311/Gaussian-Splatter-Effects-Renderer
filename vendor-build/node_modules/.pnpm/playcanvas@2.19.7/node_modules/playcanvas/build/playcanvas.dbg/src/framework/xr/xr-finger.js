var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class XrFinger {
  /**
   * Create a new XrFinger instance.
   *
   * @param {number} index - Index of the finger.
   * @param {XrHand} hand - Hand that the finger belongs to.
   * @ignore
   */
  constructor(index, hand) {
    /**
     * @type {number}
     * @private
     */
    __publicField(this, "_index");
    /**
     * @type {XrHand}
     * @private
     */
    __publicField(this, "_hand");
    /**
     * @type {XrJoint[]}
     * @private
     */
    __publicField(this, "_joints", []);
    /**
     * @type {XrJoint|null}
     * @private
     */
    __publicField(this, "_tip", null);
    this._index = index;
    this._hand = hand;
    this._hand._fingers.push(this);
  }
  /**
   * Gets the index of the finger. Enumeration is: thumb, index, middle, ring, little.
   *
   * @type {number}
   */
  get index() {
    return this._index;
  }
  /**
   * Gets the hand that the finger belongs to.
   *
   * @type {XrHand}
   */
  get hand() {
    return this._hand;
  }
  /**
   * Array of joints that belong to this finger, starting from joint closest to wrist all the way
   * to the tip of a finger.
   *
   * @type {XrJoint[]}
   */
  get joints() {
    return this._joints;
  }
  /**
   * Tip joint of the finger, or null if not available.
   *
   * @type {XrJoint|null}
   */
  get tip() {
    return this._tip;
  }
}
export {
  XrFinger
};
