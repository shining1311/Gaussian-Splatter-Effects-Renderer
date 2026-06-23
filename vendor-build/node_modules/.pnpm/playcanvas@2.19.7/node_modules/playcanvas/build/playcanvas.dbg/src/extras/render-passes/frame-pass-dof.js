var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Color } from "../../core/math/color.js";
import { Texture } from "../../platform/graphics/texture.js";
import { RenderTarget } from "../../platform/graphics/render-target.js";
import { FramePass } from "../../platform/graphics/frame-pass.js";
import { FILTER_LINEAR, ADDRESS_CLAMP_TO_EDGE, PIXELFORMAT_RG8, PIXELFORMAT_R8 } from "../../platform/graphics/constants.js";
import { RenderPassDownsample } from "./render-pass-downsample.js";
import { RenderPassCoC } from "./render-pass-coc.js";
import { RenderPassDofBlur } from "./render-pass-dof-blur.js";
class FramePassDof extends FramePass {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {CameraComponent} cameraComponent - The camera component.
   * @param {Texture} sceneTexture - The full resolution texture.
   * @param {Texture} sceneTextureHalf - The half resolution texture.
   * @param {boolean} highQuality - Whether to use high quality setup.
   * @param {boolean} nearBlur - Whether to apply near blur.
   */
  constructor(device, cameraComponent, sceneTexture, sceneTextureHalf, highQuality, nearBlur) {
    super(device);
    __publicField(this, "focusDistance", 100);
    __publicField(this, "focusRange", 50);
    __publicField(this, "blurRadius", 1);
    __publicField(this, "blurRings", 3);
    __publicField(this, "blurRingPoints", 3);
    __publicField(this, "highQuality", true);
    /** @type {Texture|null} */
    __publicField(this, "cocTexture", null);
    /** @type {Texture|null} */
    __publicField(this, "blurTexture", null);
    /** @type {RenderPassCoC|null} */
    __publicField(this, "cocPass", null);
    /** @type {RenderPassDownsample|null} */
    __publicField(this, "farPass", null);
    /** @type {RenderPassDofBlur|null} */
    __publicField(this, "blurPass", null);
    this.highQuality = highQuality;
    this.cocPass = this.setupCocPass(device, cameraComponent, sceneTexture, nearBlur);
    this.beforePasses.push(this.cocPass);
    const sourceTexture = highQuality ? sceneTexture : sceneTextureHalf;
    this.farPass = this.setupFarPass(device, sourceTexture, 0.5);
    this.beforePasses.push(this.farPass);
    this.blurPass = this.setupBlurPass(device, sceneTextureHalf, nearBlur, highQuality ? 2 : 0.5);
    this.beforePasses.push(this.blurPass);
  }
  destroy() {
    this.destroyRenderPasses();
    this.cocPass = null;
    this.farPass = null;
    this.blurPass = null;
    this.destroyRT(this.cocRT);
    this.destroyRT(this.farRt);
    this.destroyRT(this.blurRt);
    this.cocRT = null;
    this.farRt = null;
    this.blurRt = null;
  }
  destroyRenderPasses() {
    for (let i = 0; i < this.beforePasses.length; i++) {
      this.beforePasses[i].destroy();
    }
    this.beforePasses.length = 0;
  }
  destroyRT(rt) {
    if (rt) {
      rt.destroyTextureBuffers();
      rt.destroy();
    }
  }
  setupCocPass(device, cameraComponent, sourceTexture, nearBlur) {
    const format = nearBlur ? PIXELFORMAT_RG8 : PIXELFORMAT_R8;
    this.cocRT = this.createRenderTarget("CoCTexture", format);
    this.cocTexture = this.cocRT.colorBuffer;
    const cocPass = new RenderPassCoC(device, cameraComponent, nearBlur);
    cocPass.init(this.cocRT, {
      resizeSource: sourceTexture
    });
    cocPass.setClearColor(Color.BLACK);
    return cocPass;
  }
  setupFarPass(device, sourceTexture, scale) {
    this.farRt = this.createRenderTarget("FarDofTexture", sourceTexture.format);
    const farPass = new RenderPassDownsample(device, sourceTexture, {
      boxFilter: true,
      premultiplyTexture: this.cocTexture,
      premultiplySrcChannel: "r"
      // far CoC
    });
    farPass.init(this.farRt, {
      resizeSource: sourceTexture,
      scaleX: scale,
      scaleY: scale
    });
    farPass.setClearColor(Color.BLACK);
    return farPass;
  }
  setupBlurPass(device, nearTexture, nearBlur, scale) {
    const farTexture = this.farRt?.colorBuffer;
    this.blurRt = this.createRenderTarget("DofBlurTexture", nearTexture.format);
    this.blurTexture = this.blurRt.colorBuffer;
    const blurPass = new RenderPassDofBlur(device, nearBlur ? nearTexture : null, farTexture, this.cocTexture);
    blurPass.init(this.blurRt, {
      resizeSource: nearTexture,
      scaleX: scale,
      scaleY: scale
    });
    blurPass.setClearColor(Color.BLACK);
    return blurPass;
  }
  createTexture(name, format) {
    return new Texture(this.device, {
      name,
      width: 1,
      height: 1,
      format,
      mipmaps: false,
      minFilter: FILTER_LINEAR,
      magFilter: FILTER_LINEAR,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE
    });
  }
  createRenderTarget(name, format) {
    return new RenderTarget({
      colorBuffer: this.createTexture(name, format),
      depth: false,
      stencil: false
    });
  }
  frameUpdate() {
    super.frameUpdate();
    this.cocPass.focusDistance = this.focusDistance;
    this.cocPass.focusRange = this.focusRange;
    this.blurPass.blurRadiusNear = this.blurRadius;
    this.blurPass.blurRadiusFar = this.blurRadius;
    this.blurPass.blurRings = this.blurRings;
    this.blurPass.blurRingPoints = this.blurRingPoints;
  }
}
export {
  FramePassDof
};
