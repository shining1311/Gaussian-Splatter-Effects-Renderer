var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Color } from "../../core/math/color.js";
import { Texture } from "../../platform/graphics/texture.js";
import { BlendState } from "../../platform/graphics/blend-state.js";
import { RenderTarget } from "../../platform/graphics/render-target.js";
import { FramePass } from "../../platform/graphics/frame-pass.js";
import { FILTER_LINEAR, ADDRESS_CLAMP_TO_EDGE } from "../../platform/graphics/constants.js";
import { RenderPassDownsample } from "./render-pass-downsample.js";
import { RenderPassUpsample } from "./render-pass-upsample.js";
import { math } from "../../core/math/math.js";
class FramePassBloom extends FramePass {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {Texture} sourceTexture - The source texture, usually at half the resolution of the
   * render target getting blurred.
   * @param {number} format - The texture format.
   */
  constructor(device, sourceTexture, format) {
    super(device);
    __publicField(this, "bloomTexture");
    __publicField(this, "blurLevel", 16);
    __publicField(this, "bloomRenderTarget");
    __publicField(this, "textureFormat");
    __publicField(this, "renderTargets", []);
    this._sourceTexture = sourceTexture;
    this.textureFormat = format;
    this.bloomRenderTarget = this.createRenderTarget(0);
    this.bloomTexture = this.bloomRenderTarget.colorBuffer;
  }
  destroy() {
    this.destroyRenderPasses();
    this.destroyRenderTargets();
  }
  destroyRenderTargets(startIndex = 0) {
    for (let i = startIndex; i < this.renderTargets.length; i++) {
      const rt = this.renderTargets[i];
      rt.destroyTextureBuffers();
      rt.destroy();
    }
    this.renderTargets.length = 0;
  }
  destroyRenderPasses() {
    for (let i = 0; i < this.beforePasses.length; i++) {
      this.beforePasses[i].destroy();
    }
    this.beforePasses.length = 0;
  }
  createRenderTarget(index) {
    return new RenderTarget({
      depth: false,
      colorBuffer: new Texture(this.device, {
        name: `BloomTexture${index}`,
        width: 1,
        height: 1,
        format: this.textureFormat,
        mipmaps: false,
        minFilter: FILTER_LINEAR,
        magFilter: FILTER_LINEAR,
        addressU: ADDRESS_CLAMP_TO_EDGE,
        addressV: ADDRESS_CLAMP_TO_EDGE
      })
    });
  }
  createRenderTargets(count) {
    for (let i = 0; i < count; i++) {
      const rt = i === 0 ? this.bloomRenderTarget : this.createRenderTarget(i);
      this.renderTargets.push(rt);
    }
  }
  // number of levels till hitting min size
  calcMipLevels(width, height, minSize) {
    const min = Math.min(width, height);
    return Math.floor(Math.log2(min) - Math.log2(minSize));
  }
  createRenderPasses(numPasses) {
    const device = this.device;
    let passSourceTexture = this._sourceTexture;
    for (let i = 0; i < numPasses; i++) {
      const pass = new RenderPassDownsample(device, passSourceTexture);
      const rt = this.renderTargets[i];
      pass.init(rt, {
        resizeSource: passSourceTexture,
        scaleX: 0.5,
        scaleY: 0.5
      });
      pass.setClearColor(Color.BLACK);
      this.beforePasses.push(pass);
      passSourceTexture = rt.colorBuffer;
    }
    passSourceTexture = this.renderTargets[numPasses - 1].colorBuffer;
    for (let i = numPasses - 2; i >= 0; i--) {
      const pass = new RenderPassUpsample(device, passSourceTexture);
      const rt = this.renderTargets[i];
      pass.init(rt);
      pass.blendState = BlendState.ADDBLEND;
      this.beforePasses.push(pass);
      passSourceTexture = rt.colorBuffer;
    }
  }
  onDisable() {
    this.renderTargets[0]?.resize(1, 1);
    this.destroyRenderPasses();
    this.destroyRenderTargets(1);
  }
  frameUpdate() {
    super.frameUpdate();
    const maxNumPasses = this.calcMipLevels(this._sourceTexture.width, this._sourceTexture.height, 1);
    const numPasses = math.clamp(maxNumPasses, 1, this.blurLevel);
    if (this.renderTargets.length !== numPasses) {
      this.destroyRenderPasses();
      this.destroyRenderTargets(1);
      this.createRenderTargets(numPasses);
      this.createRenderPasses(numPasses);
    }
  }
}
export {
  FramePassBloom
};
