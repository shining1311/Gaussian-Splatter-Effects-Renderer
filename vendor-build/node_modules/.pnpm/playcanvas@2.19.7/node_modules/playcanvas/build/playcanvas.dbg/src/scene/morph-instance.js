import { Debug } from "../core/debug.js";
import { SEMANTIC_POSITION } from "../platform/graphics/constants.js";
import { drawQuadWithShader } from "./graphics/quad-render-utils.js";
import { RenderTarget } from "../platform/graphics/render-target.js";
import { DebugGraphics } from "../platform/graphics/debug-graphics.js";
import { ShaderUtils } from "./shader-lib/shader-utils.js";
import { BlendState } from "../platform/graphics/blend-state.js";
class MorphInstance {
  /**
   * Create a new MorphInstance instance.
   *
   * @param {Morph} morph - The {@link Morph} to instance.
   */
  constructor(morph) {
    this.morph = morph;
    morph.incRefCount();
    this.device = morph.device;
    const maxNumTargets = morph._targets.length;
    this.shader = this._createShader(maxNumTargets);
    this._weights = [];
    this._weightMap = /* @__PURE__ */ new Map();
    for (let v = 0; v < morph._targets.length; v++) {
      const target = morph._targets[v];
      if (target.name) {
        this._weightMap.set(target.name, v);
      }
      this.setWeight(v, target.defaultWeight);
    }
    this._shaderMorphWeights = new Float32Array(maxNumTargets);
    this._shaderMorphIndex = new Uint32Array(maxNumTargets);
    const createRT = (name, textureVar) => {
      this[textureVar] = morph._createTexture(name, morph._renderTextureFormat);
      return new RenderTarget({
        colorBuffer: this[textureVar],
        depth: false
      });
    };
    if (morph.morphPositions) {
      this.rtPositions = createRT("MorphRTPos", "texturePositions");
    }
    if (morph.morphNormals) {
      this.rtNormals = createRT("MorphRTNrm", "textureNormals");
    }
    this._textureParams = new Float32Array([morph.morphTextureWidth, morph.morphTextureHeight]);
    const halfSize = morph.aabb.halfExtents;
    this._aabbSize = new Float32Array([halfSize.x * 4, halfSize.y * 4, halfSize.z * 4]);
    const min = morph.aabb.getMin();
    this._aabbMin = new Float32Array([min.x * 2, min.y * 2, min.z * 2]);
    this._aabbNrmSize = new Float32Array([2, 2, 2]);
    this._aabbNrmMin = new Float32Array([-1, -1, -1]);
    this.aabbSizeId = this.device.scope.resolve("aabbSize");
    this.aabbMinId = this.device.scope.resolve("aabbMin");
    this.morphTextureId = this.device.scope.resolve("morphTexture");
    this.morphFactor = this.device.scope.resolve("morphFactor[0]");
    this.morphIndex = this.device.scope.resolve("morphIndex[0]");
    this.countId = this.device.scope.resolve("count");
    this.zeroTextures = false;
  }
  /**
   * Frees video memory allocated by this object.
   */
  destroy() {
    this.shader = null;
    const morph = this.morph;
    if (morph) {
      this.morph = null;
      morph.decRefCount();
      if (morph.refCount < 1) {
        morph.destroy();
      }
    }
    this.rtPositions?.destroy();
    this.rtPositions = null;
    this.texturePositions?.destroy();
    this.texturePositions = null;
    this.rtNormals?.destroy();
    this.rtNormals = null;
    this.textureNormals?.destroy();
    this.textureNormals = null;
  }
  /**
   * Clones a MorphInstance. The returned clone uses the same {@link Morph} and weights are set
   * to defaults.
   *
   * @returns {MorphInstance} A clone of the specified MorphInstance.
   */
  clone() {
    return new MorphInstance(this.morph);
  }
  _getWeightIndex(key) {
    if (typeof key === "string") {
      const index = this._weightMap.get(key);
      if (index === void 0) {
        Debug.errorOnce(`Cannot find morph target with name: ${key}.`);
      }
      return index;
    }
    return key;
  }
  /**
   * Gets current weight of the specified morph target.
   *
   * @param {string|number} key - An identifier for the morph target. Either the weight index or
   * the weight name.
   * @returns {number} Weight.
   */
  getWeight(key) {
    const index = this._getWeightIndex(key);
    return this._weights[index];
  }
  /**
   * Sets weight of the specified morph target.
   *
   * @param {string|number} key - An identifier for the morph target. Either the weight index or
   * the weight name.
   * @param {number} weight - Weight.
   */
  setWeight(key, weight) {
    const index = this._getWeightIndex(key);
    Debug.assert(index >= 0 && index < this.morph._targets.length);
    this._weights[index] = weight;
    this._dirty = true;
  }
  /**
   * Create the shader for texture based morphing.
   *
   * @param {number} maxCount - Maximum bumber of textures to blend.
   * @returns {Shader} Shader.
   * @private
   */
  _createShader(maxCount) {
    const defines = /* @__PURE__ */ new Map();
    defines.set("{MORPH_TEXTURE_MAX_COUNT}", maxCount);
    if (this.morph.intRenderFormat) defines.set("MORPH_INT", "");
    const outputType = this.morph.intRenderFormat ? "uvec4" : "vec4";
    return ShaderUtils.createShader(this.device, {
      uniqueName: `TextureMorphShader_${maxCount}-${this.morph.intRenderFormat ? "int" : "float"}`,
      attributes: { vertex_position: SEMANTIC_POSITION },
      vertexChunk: "morphVS",
      fragmentChunk: "morphPS",
      fragmentDefines: defines,
      fragmentOutputTypes: [outputType]
    });
  }
  _updateTextureRenderTarget(renderTarget, activeCount, isPos) {
    const { morph, device } = this;
    this.setAabbUniforms(isPos);
    this.morphTextureId.setValue(isPos ? morph.targetsTexturePositions : morph.targetsTextureNormals);
    device.setBlendState(BlendState.NOBLEND);
    this.countId.setValue(activeCount);
    this.morphFactor.setValue(this._shaderMorphWeights);
    this.morphIndex.setValue(this._shaderMorphIndex);
    drawQuadWithShader(device, renderTarget, this.shader);
  }
  _updateTextureMorph(activeCount) {
    const device = this.device;
    DebugGraphics.pushGpuMarker(device, "MorphUpdate");
    if (activeCount > 0 || !this.zeroTextures) {
      if (this.rtPositions) {
        this._updateTextureRenderTarget(this.rtPositions, activeCount, true);
      }
      if (this.rtNormals) {
        this._updateTextureRenderTarget(this.rtNormals, activeCount, false);
      }
      this.zeroTextures = activeCount === 0;
    }
    DebugGraphics.popGpuMarker(device);
  }
  setAabbUniforms(isPos = true) {
    this.aabbSizeId.setValue(isPos ? this._aabbSize : this._aabbNrmSize);
    this.aabbMinId.setValue(isPos ? this._aabbMin : this._aabbNrmMin);
  }
  prepareRendering(device) {
    this.setAabbUniforms();
  }
  /**
   * Selects active morph targets and prepares morph for rendering. Called automatically by
   * renderer.
   */
  update() {
    this._dirty = false;
    const targets = this.morph._targets;
    const epsilon = 1e-5;
    const weights = this._shaderMorphWeights;
    const indices = this._shaderMorphIndex;
    let activeCount = 0;
    for (let i = 0; i < targets.length; i++) {
      if (Math.abs(this.getWeight(i)) > epsilon) {
        weights[activeCount] = this.getWeight(i);
        indices[activeCount] = i;
        activeCount++;
      }
    }
    this._updateTextureMorph(activeCount);
  }
}
export {
  MorphInstance
};
