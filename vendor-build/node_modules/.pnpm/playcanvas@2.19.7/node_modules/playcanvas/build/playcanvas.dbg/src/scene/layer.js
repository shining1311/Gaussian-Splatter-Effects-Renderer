var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../core/debug.js";
import { hash32Fnv1a } from "../core/hash.js";
import {
  LIGHTTYPE_DIRECTIONAL,
  SORTMODE_BACK2FRONT,
  SORTMODE_CUSTOM,
  SORTMODE_FRONT2BACK,
  SORTMODE_MATERIALMESH,
  SORTMODE_NONE
} from "./constants.js";
import { Material } from "./materials/material.js";
let layerCounter = 0;
const lightKeys = [];
const _tempMaterials = /* @__PURE__ */ new Set();
function sortManual(drawCallA, drawCallB) {
  return drawCallA.drawOrder - drawCallB.drawOrder;
}
function sortMaterialMesh(drawCallA, drawCallB) {
  const keyA = drawCallA._sortKeyForward;
  const keyB = drawCallB._sortKeyForward;
  if (keyA === keyB) {
    return drawCallB.mesh.id - drawCallA.mesh.id;
  }
  return keyB - keyA;
}
function sortBackToFront(drawCallA, drawCallB) {
  return drawCallB._sortKeyDynamic - drawCallA._sortKeyDynamic;
}
function sortFrontToBack(drawCallA, drawCallB) {
  return drawCallA._sortKeyDynamic - drawCallB._sortKeyDynamic;
}
const sortCallbacks = [null, sortManual, sortMaterialMesh, sortBackToFront, sortFrontToBack];
class CulledInstances {
  constructor() {
    /**
     * Visible opaque mesh instances.
     *
     * @type {MeshInstance[]}
     */
    __publicField(this, "opaque", []);
    /**
     * Visible transparent mesh instances.
     *
     * @type {MeshInstance[]}
     */
    __publicField(this, "transparent", []);
  }
}
class Layer {
  /**
   * Create a new Layer instance.
   *
   * @param {object} options - Object for passing optional arguments. These arguments are the
   * same as properties of the Layer.
   */
  constructor(options = {}) {
    // --- Identity ---
    /**
     * A unique ID of the layer. Layer IDs are stored inside {@link ModelComponent#layers},
     * {@link RenderComponent#layers}, {@link CameraComponent#layers},
     * {@link LightComponent#layers} and {@link ElementComponent#layers} instead of names.
     * Can be used in {@link LayerComposition#getLayerById}.
     *
     * @type {number}
     */
    __publicField(this, "id");
    /**
     * Name of the layer. Can be used in {@link LayerComposition#getLayerByName}.
     *
     * @type {string}
     */
    __publicField(this, "name");
    // --- Enabled state & ref counting ---
    /**
     * @type {boolean}
     * @private
     */
    __publicField(this, "_enabled", true);
    /**
     * @type {number}
     * @private
     */
    __publicField(this, "_refCounter", 1);
    // --- Sorting ---
    /**
     * Defines the method used for sorting opaque (that is, not semi-transparent) mesh
     * instances before rendering. Can be:
     *
     * - {@link SORTMODE_NONE}
     * - {@link SORTMODE_MANUAL}
     * - {@link SORTMODE_MATERIALMESH}
     * - {@link SORTMODE_BACK2FRONT}
     * - {@link SORTMODE_FRONT2BACK}
     *
     * Defaults to {@link SORTMODE_MATERIALMESH}.
     *
     * @type {number}
     */
    __publicField(this, "opaqueSortMode", SORTMODE_MATERIALMESH);
    /**
     * Defines the method used for sorting semi-transparent mesh instances before rendering. Can be:
     *
     * - {@link SORTMODE_NONE}
     * - {@link SORTMODE_MANUAL}
     * - {@link SORTMODE_MATERIALMESH}
     * - {@link SORTMODE_BACK2FRONT}
     * - {@link SORTMODE_FRONT2BACK}
     *
     * Defaults to {@link SORTMODE_BACK2FRONT}.
     *
     * @type {number}
     */
    __publicField(this, "transparentSortMode", SORTMODE_BACK2FRONT);
    /**
     * @type {Function|null}
     * @ignore
     */
    __publicField(this, "customSortCallback", null);
    /**
     * @type {Function|null}
     * @ignore
     */
    __publicField(this, "customCalculateSortValues", null);
    // --- Clear flags ---
    /** @private */
    __publicField(this, "_clearColorBuffer", false);
    /** @private */
    __publicField(this, "_clearDepthBuffer", false);
    /** @private */
    __publicField(this, "_clearStencilBuffer", false);
    // --- Enable / disable callbacks ---
    /**
     * Custom function that is called after the layer has been enabled. This happens when:
     *
     * - The layer is created with {@link enabled} set to true (which is the default value).
     * - {@link enabled} was changed from false to true
     *
     * @type {Function}
     */
    __publicField(this, "onEnable");
    /**
     * Custom function that is called after the layer has been disabled. This happens when:
     *
     * - {@link enabled} was changed from true to false
     * - {@link decrementCounter} was called and set the counter to zero.
     *
     * @type {Function}
     */
    __publicField(this, "onDisable");
    // --- Mesh instances & shadow casters ---
    /**
     * Mesh instances assigned to this layer.
     *
     * @type {MeshInstance[]}
     * @ignore
     */
    __publicField(this, "meshInstances", []);
    /**
     * Mesh instances assigned to this layer, stored in a set.
     *
     * @type {Set<MeshInstance>}
     * @ignore
     */
    __publicField(this, "meshInstancesSet", /* @__PURE__ */ new Set());
    /**
     * Shadow casting instances assigned to this layer.
     *
     * @type {MeshInstance[]}
     * @ignore
     */
    __publicField(this, "shadowCasters", []);
    /**
     * Shadow casting instances assigned to this layer, stored in a set.
     *
     * @type {Set<MeshInstance>}
     * @ignore
     */
    __publicField(this, "shadowCastersSet", /* @__PURE__ */ new Set());
    /**
     * Visible (culled) mesh instances assigned to this layer. Looked up by the Camera.
     *
     * @type {WeakMap<Camera, CulledInstances>}
     * @private
     */
    __publicField(this, "_visibleInstances", /* @__PURE__ */ new WeakMap());
    // --- Lights ---
    /**
     * All lights assigned to a layer.
     *
     * @type {Light[]}
     * @private
     */
    __publicField(this, "_lights", []);
    /**
     * All lights assigned to a layer stored in a set.
     *
     * @type {Set<Light>}
     * @private
     */
    __publicField(this, "_lightsSet", /* @__PURE__ */ new Set());
    /**
     * Set of light used by clustered lighting (omni and spot, but no directional).
     *
     * @type {Set<Light>}
     * @private
     */
    __publicField(this, "_clusteredLightsSet", /* @__PURE__ */ new Set());
    /**
     * Lights separated by light type. Lights in the individual arrays are sorted by the key,
     * to match their order in _lightIdHash, so that their order matches the order expected by the
     * generated shader code.
     *
     * @type {Light[][]}
     * @private
     */
    __publicField(this, "_splitLights", [[], [], []]);
    /**
     * True if _splitLights needs to be updated, which means if lights were added or removed from
     * the layer, or their key changed.
     *
     * @private
     */
    __publicField(this, "_splitLightsDirty", true);
    /** @private */
    __publicField(this, "_lightHash", 0);
    /** @private */
    __publicField(this, "_lightHashDirty", false);
    /** @private */
    __publicField(this, "_lightIdHash", 0);
    /** @private */
    __publicField(this, "_lightIdHashDirty", false);
    /**
     * True if the objects rendered on the layer require light cube (emitters with lighting do).
     *
     * @ignore
     */
    __publicField(this, "requiresLightCube", false);
    // --- Cameras ---
    /**
     * @type {CameraComponent[]}
     * @ignore
     */
    __publicField(this, "cameras", []);
    /**
     * @type {Set<Camera>}
     * @ignore
     */
    __publicField(this, "camerasSet", /* @__PURE__ */ new Set());
    // --- GSplat ---
    /**
     * @type {GSplatPlacement[]}
     * @ignore
     */
    __publicField(this, "gsplatPlacements", []);
    /**
     * @type {Set<GSplatPlacement>}
     * @ignore
     */
    __publicField(this, "gsplatPlacementsSet", /* @__PURE__ */ new Set());
    /**
     * @type {GSplatPlacement[]}
     * @ignore
     */
    __publicField(this, "gsplatShadowCasters", []);
    /**
     * @type {Set<GSplatPlacement>}
     * @ignore
     */
    __publicField(this, "gsplatShadowCastersSet", /* @__PURE__ */ new Set());
    /**
     * True if the gsplatPlacements array was modified.
     *
     * @ignore
     */
    __publicField(this, "gsplatPlacementsDirty", true);
    // --- Composition / shader versioning ---
    /**
     * True if the composition is invalidated.
     *
     * @ignore
     */
    __publicField(this, "_dirtyComposition", false);
    /** @private */
    __publicField(this, "_shaderVersion", -1);
    // --- Profiler ---
    __publicField(this, "skipRenderAfter", Number.MAX_VALUE);
    __publicField(this, "_skipRenderCounter", 0);
    __publicField(this, "_renderTime", 0);
    __publicField(this, "_forwardDrawCalls", 0);
    // deprecated, not useful on a layer anymore, could be moved to camera
    __publicField(this, "_shadowDrawCalls", 0);
    if (options.id !== void 0) {
      this.id = options.id;
      layerCounter = Math.max(this.id + 1, layerCounter);
    } else {
      this.id = layerCounter++;
    }
    this.name = options.name;
    this._enabled = options.enabled ?? true;
    this._refCounter = this._enabled ? 1 : 0;
    this.opaqueSortMode = options.opaqueSortMode ?? SORTMODE_MATERIALMESH;
    this.transparentSortMode = options.transparentSortMode ?? SORTMODE_BACK2FRONT;
    this._clearColorBuffer = !!options.clearColorBuffer;
    this._clearDepthBuffer = !!options.clearDepthBuffer;
    this._clearStencilBuffer = !!options.clearStencilBuffer;
    this.onEnable = options.onEnable;
    this.onDisable = options.onDisable;
    if (this._enabled && this.onEnable) {
      this.onEnable();
    }
  }
  /**
   * Sets the enabled state of the layer. Disabled layers are skipped. Defaults to true.
   *
   * @type {boolean}
   */
  set enabled(val) {
    if (val !== this._enabled) {
      this._dirtyComposition = true;
      this.gsplatPlacementsDirty = true;
      this._enabled = val;
      if (val) {
        this.incrementCounter();
        if (this.onEnable) this.onEnable();
      } else {
        this.decrementCounter();
        if (this.onDisable) this.onDisable();
      }
    }
  }
  /**
   * Gets the enabled state of the layer.
   *
   * @type {boolean}
   */
  get enabled() {
    return this._enabled;
  }
  /**
   * Sets whether the camera will clear the color buffer when it renders this layer.
   *
   * @type {boolean}
   */
  set clearColorBuffer(val) {
    this._clearColorBuffer = val;
    this._dirtyComposition = true;
  }
  /**
   * Gets whether the camera will clear the color buffer when it renders this layer.
   *
   * @type {boolean}
   */
  get clearColorBuffer() {
    return this._clearColorBuffer;
  }
  /**
   * Sets whether the camera will clear the depth buffer when it renders this layer.
   *
   * @type {boolean}
   */
  set clearDepthBuffer(val) {
    this._clearDepthBuffer = val;
    this._dirtyComposition = true;
  }
  /**
   * Gets whether the camera will clear the depth buffer when it renders this layer.
   *
   * @type {boolean}
   */
  get clearDepthBuffer() {
    return this._clearDepthBuffer;
  }
  /**
   * Sets whether the camera will clear the stencil buffer when it renders this layer.
   *
   * @type {boolean}
   */
  set clearStencilBuffer(val) {
    this._clearStencilBuffer = val;
    this._dirtyComposition = true;
  }
  /**
   * Gets whether the camera will clear the stencil buffer when it renders this layer.
   *
   * @type {boolean}
   */
  get clearStencilBuffer() {
    return this._clearStencilBuffer;
  }
  /**
   * Gets whether the layer contains omni or spot lights.
   *
   * @type {boolean}
   * @ignore
   */
  get hasClusteredLights() {
    return this._clusteredLightsSet.size > 0;
  }
  /**
   * Gets the lights used by clustered lighting in a set.
   *
   * @type {Set<Light>}
   * @ignore
   */
  get clusteredLightsSet() {
    return this._clusteredLightsSet;
  }
  /**
   * Increments the usage counter of this layer. By default, layers are created with counter set
   * to 1 (if {@link Layer.enabled} is true) or 0 (if it was false). Incrementing the counter
   * from 0 to 1 will enable the layer and call {@link Layer.onEnable}. Use this function to
   * "subscribe" multiple effects to the same layer. For example, if the layer is used to render
   * a reflection texture which is used by 2 mirrors, then each mirror can call this function
   * when visible and {@link Layer.decrementCounter} if invisible. In such case the reflection
   * texture won't be updated, when there is nothing to use it, saving performance.
   *
   * @ignore
   */
  incrementCounter() {
    if (this._refCounter === 0) {
      this._enabled = true;
      if (this.onEnable) this.onEnable();
    }
    this._refCounter++;
  }
  /**
   * Decrements the usage counter of this layer. Decrementing the counter from 1 to 0 will
   * disable the layer and call {@link Layer.onDisable}.
   *
   * @ignore
   */
  decrementCounter() {
    if (this._refCounter === 1) {
      this._enabled = false;
      if (this.onDisable) this.onDisable();
    } else if (this._refCounter === 0) {
      Debug.warn("Trying to decrement layer counter below 0");
      return;
    }
    this._refCounter--;
  }
  /**
   * Adds a gsplat placement to this layer.
   *
   * @param {GSplatPlacement} placement - A placement of a gsplat.
   * @ignore
   */
  addGSplatPlacement(placement) {
    if (!this.gsplatPlacementsSet.has(placement)) {
      this.gsplatPlacements.push(placement);
      this.gsplatPlacementsSet.add(placement);
      this.gsplatPlacementsDirty = true;
    }
  }
  /**
   * Removes a gsplat placement from this layer.
   *
   * @param {GSplatPlacement} placement - A placement of a gsplat.
   * @ignore
   */
  removeGSplatPlacement(placement) {
    const index = this.gsplatPlacements.indexOf(placement);
    if (index >= 0) {
      this.gsplatPlacements.splice(index, 1);
      this.gsplatPlacementsSet.delete(placement);
      this.gsplatPlacementsDirty = true;
    }
  }
  /**
   * Adds a gsplat placement to this layer as a shadow caster.
   *
   * @param {GSplatPlacement} placement - A placement of a gsplat.
   * @ignore
   */
  addGSplatShadowCaster(placement) {
    if (!this.gsplatShadowCastersSet.has(placement)) {
      this.gsplatShadowCasters.push(placement);
      this.gsplatShadowCastersSet.add(placement);
      this.gsplatPlacementsDirty = true;
    }
  }
  /**
   * Removes a gsplat placement from the shadow casters of this layer.
   *
   * @param {GSplatPlacement} placement - A placement of a gsplat.
   * @ignore
   */
  removeGSplatShadowCaster(placement) {
    const index = this.gsplatShadowCasters.indexOf(placement);
    if (index >= 0) {
      this.gsplatShadowCasters.splice(index, 1);
      this.gsplatShadowCastersSet.delete(placement);
      this.gsplatPlacementsDirty = true;
    }
  }
  /**
   * Adds an array of mesh instances to this layer.
   *
   * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}.
   * @param {boolean} [skipShadowCasters] - Set it to true if you don't want these mesh instances
   * to cast shadows in this layer. Defaults to false.
   */
  addMeshInstances(meshInstances, skipShadowCasters) {
    const destMeshInstances = this.meshInstances;
    const destMeshInstancesSet = this.meshInstancesSet;
    for (let i = 0; i < meshInstances.length; i++) {
      const mi = meshInstances[i];
      if (!destMeshInstancesSet.has(mi)) {
        destMeshInstances.push(mi);
        destMeshInstancesSet.add(mi);
        _tempMaterials.add(mi.material);
      }
    }
    if (!skipShadowCasters) {
      this.addShadowCasters(meshInstances);
    }
    if (_tempMaterials.size > 0) {
      const sceneShaderVer = this._shaderVersion;
      _tempMaterials.forEach((mat) => {
        if (sceneShaderVer >= 0 && mat._shaderVersion !== sceneShaderVer) {
          if (mat.getShaderVariant !== Material.prototype.getShaderVariant) {
            mat.clearVariants();
          }
          mat._shaderVersion = sceneShaderVer;
        }
      });
      _tempMaterials.clear();
    }
  }
  /**
   * Removes multiple mesh instances from this layer.
   *
   * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}. If they were added to
   * this layer, they will be removed.
   * @param {boolean} [skipShadowCasters] - Set it to true if you want to still cast shadows from
   * removed mesh instances or if they never did cast shadows before. Defaults to false.
   */
  removeMeshInstances(meshInstances, skipShadowCasters) {
    const destMeshInstances = this.meshInstances;
    const destMeshInstancesSet = this.meshInstancesSet;
    for (let i = 0; i < meshInstances.length; i++) {
      const mi = meshInstances[i];
      if (destMeshInstancesSet.has(mi)) {
        destMeshInstancesSet.delete(mi);
        const j = destMeshInstances.indexOf(mi);
        if (j >= 0) {
          destMeshInstances.splice(j, 1);
        }
      }
    }
    if (!skipShadowCasters) {
      this.removeShadowCasters(meshInstances);
    }
  }
  /**
   * Adds an array of mesh instances to this layer, but only as shadow casters (they will not be
   * rendered anywhere, but only cast shadows on other objects).
   *
   * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}.
   */
  addShadowCasters(meshInstances) {
    const shadowCasters = this.shadowCasters;
    const shadowCastersSet = this.shadowCastersSet;
    for (let i = 0; i < meshInstances.length; i++) {
      const mi = meshInstances[i];
      if (mi.castShadow && !shadowCastersSet.has(mi)) {
        shadowCastersSet.add(mi);
        shadowCasters.push(mi);
      }
    }
  }
  /**
   * Removes multiple mesh instances from the shadow casters list of this layer, meaning they
   * will stop casting shadows.
   *
   * @param {MeshInstance[]} meshInstances - Array of {@link MeshInstance}. If they were added to
   * this layer, they will be removed.
   */
  removeShadowCasters(meshInstances) {
    const shadowCasters = this.shadowCasters;
    const shadowCastersSet = this.shadowCastersSet;
    for (let i = 0; i < meshInstances.length; i++) {
      const mi = meshInstances[i];
      if (shadowCastersSet.has(mi)) {
        shadowCastersSet.delete(mi);
        const j = shadowCasters.indexOf(mi);
        if (j >= 0) {
          shadowCasters.splice(j, 1);
        }
      }
    }
  }
  /**
   * Removes all mesh instances from this layer.
   *
   * @param {boolean} [skipShadowCasters] - Set it to true if you want to continue the existing mesh
   * instances to cast shadows. Defaults to false, which removes shadow casters as well.
   */
  clearMeshInstances(skipShadowCasters = false) {
    this.meshInstances.length = 0;
    this.meshInstancesSet.clear();
    if (!skipShadowCasters) {
      this.shadowCasters.length = 0;
      this.shadowCastersSet.clear();
    }
  }
  markLightsDirty() {
    this._lightHashDirty = true;
    this._lightIdHashDirty = true;
    this._splitLightsDirty = true;
  }
  hasLight(light) {
    return this._lightsSet.has(light);
  }
  /**
   * Adds a light to this layer.
   *
   * @param {LightComponent} light - A {@link LightComponent}.
   */
  addLight(light) {
    const l = light.light;
    if (!this._lightsSet.has(l)) {
      this._lightsSet.add(l);
      this._lights.push(l);
      this.markLightsDirty();
    }
    if (l.type !== LIGHTTYPE_DIRECTIONAL) {
      this._clusteredLightsSet.add(l);
    }
  }
  /**
   * Removes a light from this layer.
   *
   * @param {LightComponent} light - A {@link LightComponent}.
   */
  removeLight(light) {
    const l = light.light;
    if (this._lightsSet.has(l)) {
      this._lightsSet.delete(l);
      this._lights.splice(this._lights.indexOf(l), 1);
      this.markLightsDirty();
    }
    if (l.type !== LIGHTTYPE_DIRECTIONAL) {
      this._clusteredLightsSet.delete(l);
    }
  }
  /**
   * Removes all lights from this layer.
   */
  clearLights() {
    this._lightsSet.forEach((light) => light.removeLayer(this));
    this._lightsSet.clear();
    this._clusteredLightsSet.clear();
    this._lights.length = 0;
    this.markLightsDirty();
  }
  get splitLights() {
    if (this._splitLightsDirty) {
      this._splitLightsDirty = false;
      const splitLights = this._splitLights;
      for (let i = 0; i < splitLights.length; i++) {
        splitLights[i].length = 0;
      }
      const lights = this._lights;
      for (let i = 0; i < lights.length; i++) {
        const light = lights[i];
        if (light.enabled) {
          splitLights[light._type].push(light);
        }
      }
      for (let i = 0; i < splitLights.length; i++) {
        splitLights[i].sort((a, b) => a.key - b.key);
      }
    }
    return this._splitLights;
  }
  evaluateLightHash(localLights, directionalLights, useIds) {
    let hash = 0;
    const lights = this._lights;
    for (let i = 0; i < lights.length; i++) {
      const isLocalLight = lights[i].type !== LIGHTTYPE_DIRECTIONAL;
      if (localLights && isLocalLight || directionalLights && !isLocalLight) {
        lightKeys.push(useIds ? lights[i].id : lights[i].key);
      }
    }
    if (lightKeys.length > 0) {
      lightKeys.sort();
      hash = hash32Fnv1a(lightKeys);
      lightKeys.length = 0;
    }
    return hash;
  }
  getLightHash(isClustered) {
    if (this._lightHashDirty) {
      this._lightHashDirty = false;
      this._lightHash = this.evaluateLightHash(!isClustered, true, false);
    }
    return this._lightHash;
  }
  // This is only used in clustered lighting mode
  getLightIdHash() {
    if (this._lightIdHashDirty) {
      this._lightIdHashDirty = false;
      this._lightIdHash = this.evaluateLightHash(true, false, true);
    }
    return this._lightIdHash;
  }
  /**
   * Adds a camera to this layer.
   *
   * @param {CameraComponent} camera - A {@link CameraComponent}.
   */
  addCamera(camera) {
    if (!this.camerasSet.has(camera.camera)) {
      this.camerasSet.add(camera.camera);
      this.cameras.push(camera);
      this._dirtyComposition = true;
    }
  }
  /**
   * Removes a camera from this layer.
   *
   * @param {CameraComponent} camera - A {@link CameraComponent}.
   */
  removeCamera(camera) {
    if (this.camerasSet.has(camera.camera)) {
      this.camerasSet.delete(camera.camera);
      const index = this.cameras.indexOf(camera);
      this.cameras.splice(index, 1);
      this._dirtyComposition = true;
    }
  }
  /**
   * Removes all cameras from this layer.
   */
  clearCameras() {
    this.cameras.length = 0;
    this.camerasSet.clear();
    this._dirtyComposition = true;
  }
  /**
   * @param {MeshInstance[]} drawCalls - Array of mesh instances.
   * @param {Vec3} camPos - Camera position.
   * @param {Vec3} camFwd - Camera forward vector.
   * @private
   */
  _calculateSortDistances(drawCalls, camPos, camFwd) {
    const count = drawCalls.length;
    const { x: px, y: py, z: pz } = camPos;
    const { x: fx, y: fy, z: fz } = camFwd;
    for (let i = 0; i < count; i++) {
      const drawCall = drawCalls[i];
      let zDist;
      if (drawCall.calculateSortDistance) {
        zDist = drawCall.calculateSortDistance(drawCall, camPos, camFwd);
      } else {
        const meshPos = drawCall.aabb.center;
        zDist = (meshPos.x - px) * fx + (meshPos.y - py) * fy + (meshPos.z - pz) * fz;
      }
      const bucket = drawCall._drawBucket * 1e9;
      drawCall._sortKeyDynamic = bucket + zDist;
    }
  }
  /**
   * Get access to culled mesh instances for the provided camera.
   *
   * @param {Camera} camera - The camera.
   * @returns {CulledInstances} The culled mesh instances.
   * @ignore
   */
  getCulledInstances(camera) {
    let instances = this._visibleInstances.get(camera);
    if (!instances) {
      instances = new CulledInstances();
      this._visibleInstances.set(camera, instances);
    }
    return instances;
  }
  /**
   * @param {Camera} camera - The camera to sort the visible mesh instances for.
   * @param {boolean} transparent - True if transparent sorting should be used.
   * @ignore
   */
  sortVisible(camera, transparent) {
    const sortMode = transparent ? this.transparentSortMode : this.opaqueSortMode;
    if (sortMode === SORTMODE_NONE) {
      return;
    }
    const culledInstances = this.getCulledInstances(camera);
    const instances = transparent ? culledInstances.transparent : culledInstances.opaque;
    const cameraNode = camera.node;
    if (sortMode === SORTMODE_CUSTOM) {
      const sortPos = cameraNode.getPosition();
      const sortDir = cameraNode.forward;
      if (this.customCalculateSortValues) {
        this.customCalculateSortValues(instances, instances.length, sortPos, sortDir);
      }
      if (this.customSortCallback) {
        instances.sort(this.customSortCallback);
      }
    } else {
      if (sortMode === SORTMODE_BACK2FRONT || sortMode === SORTMODE_FRONT2BACK) {
        const sortPos = cameraNode.getPosition();
        const sortDir = cameraNode.forward;
        this._calculateSortDistances(instances, sortPos, sortDir);
      }
      instances.sort(sortCallbacks[sortMode]);
    }
  }
}
export {
  CulledInstances,
  Layer
};
