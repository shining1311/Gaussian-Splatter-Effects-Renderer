var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../core/event-handler.js";
class Render extends EventHandler {
  constructor() {
    super(...arguments);
    /**
     * Meshes are reference counted, and this class owns the references and is responsible for
     * releasing the meshes when they are no longer referenced.
     *
     * @type {Array<Mesh|null>|null}
     * @private
     */
    __publicField(this, "_meshes", null);
  }
  /**
   * Sets the meshes that the render contains.
   *
   * @type {Array<Mesh|null>|null}
   */
  set meshes(value) {
    this.decRefMeshes();
    this._meshes = value;
    this.incRefMeshes();
    this.fire("set:meshes", value);
  }
  /**
   * Gets the meshes that the render contains.
   *
   * @type {Array<Mesh|null>|null}
   */
  get meshes() {
    return this._meshes;
  }
  destroy() {
    this.meshes = null;
  }
  /**
   * Decrement references to meshes. Destroy the ones with zero references.
   */
  decRefMeshes() {
    this._meshes?.forEach((mesh, index) => {
      if (mesh) {
        mesh.decRefCount();
        if (mesh.refCount < 1) {
          mesh.destroy();
          this._meshes[index] = null;
        }
      }
    });
  }
  /**
   * Increments ref count on all meshes.
   */
  incRefMeshes() {
    this._meshes?.forEach((mesh) => {
      mesh?.incRefCount();
    });
  }
}
/**
 * Fired when the meshes are set on the render. The handler is passed the an array of
 * {@link Mesh} objects.
 *
 * @event
 * @example
 * render.on('set:meshes', (meshes) => {
 *     console.log(`Render has ${meshes.length} meshes`);
 * });
 */
__publicField(Render, "EVENT_SETMESHES", "set:meshes");
export {
  Render
};
