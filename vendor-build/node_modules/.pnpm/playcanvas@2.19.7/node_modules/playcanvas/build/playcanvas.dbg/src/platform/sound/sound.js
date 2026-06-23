var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class Sound {
  /**
   * Create a new Sound instance.
   *
   * @param {AudioBuffer} buffer - The decoded audio data.
   */
  constructor(buffer) {
    /**
     * Contains the decoded audio data.
     *
     * @type {AudioBuffer}
     */
    __publicField(this, "buffer");
    this.buffer = buffer;
  }
  /**
   * Gets the duration of the sound. If the sound is not loaded it returns 0.
   *
   * @type {number}
   */
  get duration() {
    return this.buffer && this.buffer.duration || 0;
  }
}
export {
  Sound
};
