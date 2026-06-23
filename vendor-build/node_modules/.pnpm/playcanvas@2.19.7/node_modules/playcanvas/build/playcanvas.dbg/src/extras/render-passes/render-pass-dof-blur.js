var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Kernel } from "../../core/math/kernel.js";
import { SEMANTIC_POSITION, SHADERLANGUAGE_GLSL, SHADERLANGUAGE_WGSL } from "../../platform/graphics/constants.js";
import { RenderPassShaderQuad } from "../../scene/graphics/render-pass-shader-quad.js";
import glsldofBlurPS from "../../scene/shader-lib/glsl/chunks/render-pass/frag/dofBlur.js";
import wgsldofBlurPS from "../../scene/shader-lib/wgsl/chunks/render-pass/frag/dofBlur.js";
import { ShaderChunks } from "../../scene/shader-lib/shader-chunks.js";
import { ShaderUtils } from "../../scene/shader-lib/shader-utils.js";
class RenderPassDofBlur extends RenderPassShaderQuad {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {Texture|null} nearTexture - The near texture to blur. Skip near blur if the texture is null.
   * @param {Texture} farTexture - The far texture to blur.
   * @param {Texture} cocTexture - The CoC texture.
   */
  constructor(device, nearTexture, farTexture, cocTexture) {
    super(device);
    __publicField(this, "blurRadiusNear", 1);
    __publicField(this, "blurRadiusFar", 1);
    __publicField(this, "_blurRings", 3);
    __publicField(this, "_blurRingPoints", 3);
    /**
     * Resolution the blur radius is calibrated against. The blur is applied as a fraction of this
     * height, making the effect resolution-independent (higher resolution only increases quality,
     * not blur strength). Applied as a uniform scale on the blur radius, so it can be changed at
     * runtime without recompiling the shader. Value 540 matches the legacy half-resolution far
     * texture at a 1080p frame, preserving previously authored blurRadius values.
     *
     * @type {number}
     */
    __publicField(this, "referenceHeight", 540);
    this.nearTexture = nearTexture;
    this.farTexture = farTexture;
    this.cocTexture = cocTexture;
    ShaderChunks.get(device, SHADERLANGUAGE_GLSL).set("dofBlurPS", glsldofBlurPS);
    ShaderChunks.get(device, SHADERLANGUAGE_WGSL).set("dofBlurPS", wgsldofBlurPS);
    const { scope } = device;
    this.kernelId = scope.resolve("kernel[0]");
    this.kernelCountId = scope.resolve("kernelCount");
    this.blurRadiusNearId = scope.resolve("blurRadiusNear");
    this.blurRadiusFarId = scope.resolve("blurRadiusFar");
    this.nearTextureId = scope.resolve("nearTexture");
    this.farTextureId = scope.resolve("farTexture");
    this.cocTextureId = scope.resolve("cocTexture");
  }
  set blurRings(value) {
    if (this._blurRings !== value) {
      this._blurRings = value;
      this.shader = null;
    }
  }
  get blurRings() {
    return this._blurRings;
  }
  set blurRingPoints(value) {
    if (this._blurRingPoints !== value) {
      this._blurRingPoints = value;
      this.shader = null;
    }
  }
  get blurRingPoints() {
    return this._blurRingPoints;
  }
  createShader() {
    this.kernel = new Float32Array(Kernel.concentric(this.blurRings, this.blurRingPoints));
    const kernelCount = this.kernel.length >> 1;
    const nearBlur = this.nearTexture !== null;
    const defines = /* @__PURE__ */ new Map();
    defines.set("{KERNEL_COUNT}", kernelCount);
    defines.set("{INV_KERNEL_COUNT}", 1 / kernelCount);
    if (nearBlur) defines.set("NEAR_BLUR", "");
    this.shader = ShaderUtils.createShader(this.device, {
      uniqueName: `DofBlurShader-${kernelCount}-${nearBlur ? "nearBlur" : "noNearBlur"}`,
      attributes: { aPosition: SEMANTIC_POSITION },
      vertexChunk: "quadVS",
      fragmentChunk: "dofBlurPS",
      fragmentDefines: defines
    });
  }
  execute() {
    if (!this.shader) {
      this.createShader();
    }
    this.nearTextureId.setValue(this.nearTexture);
    this.farTextureId.setValue(this.farTexture);
    this.cocTextureId.setValue(this.cocTexture);
    this.kernelId.setValue(this.kernel);
    this.kernelCountId.setValue(this.kernel.length >> 1);
    const referenceHeight = this.referenceHeight > 0 ? this.referenceHeight : 540;
    const invReferenceHeight = 1 / referenceHeight;
    this.blurRadiusNearId.setValue(this.blurRadiusNear * invReferenceHeight);
    this.blurRadiusFarId.setValue(this.blurRadiusFar * invReferenceHeight);
    super.execute();
  }
}
export {
  RenderPassDofBlur
};
