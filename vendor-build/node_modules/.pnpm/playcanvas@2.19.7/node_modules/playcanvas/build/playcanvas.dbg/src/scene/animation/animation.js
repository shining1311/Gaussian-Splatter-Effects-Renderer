var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class AnimationKey {
  constructor(time, position, rotation, scale) {
    this.time = time;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}
class AnimationNode {
  /**
   * Create a new AnimationNode instance.
   */
  constructor() {
    this._name = "";
    this._keys = [];
  }
}
class Animation {
  /**
   * Create a new Animation instance.
   */
  constructor() {
    /**
     * Human-readable name of the animation.
     */
    __publicField(this, "name", "");
    /**
     * Duration of the animation in seconds.
     */
    __publicField(this, "duration", 0);
    this._nodes = [];
    this._nodeDict = {};
  }
  /**
   * Gets a {@link AnimationNode} by name.
   *
   * @param {string} name - The name of the {@link AnimationNode}.
   * @returns {AnimationNode} The {@link AnimationNode} with the specified name.
   */
  getNode(name) {
    return this._nodeDict[name];
  }
  /**
   * Adds a node to the internal nodes array.
   *
   * @param {AnimationNode} node - The node to add.
   */
  addNode(node) {
    this._nodes.push(node);
    this._nodeDict[node._name] = node;
  }
  /**
   * A read-only property to get array of animation nodes.
   *
   * @type {AnimationNode[]}
   */
  get nodes() {
    return this._nodes;
  }
}
export {
  Animation,
  AnimationKey,
  AnimationNode
};
