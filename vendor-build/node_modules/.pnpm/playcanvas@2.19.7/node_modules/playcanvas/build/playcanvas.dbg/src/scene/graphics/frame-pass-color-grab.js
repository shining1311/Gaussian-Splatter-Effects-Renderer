var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ADDRESS_CLAMP_TO_EDGE, FILTER_LINEAR, FILTER_LINEAR_MIPMAP_LINEAR } from "../../platform/graphics/constants.js";
import { DebugGraphics } from "../../platform/graphics/debug-graphics.js";
import { FramePass } from "../../platform/graphics/frame-pass.js";
import { RenderTarget } from "../../platform/graphics/render-target.js";
import { Texture } from "../../platform/graphics/texture.js";
const _colorUniformName = "uSceneColorMap";
class FramePassColorGrab extends FramePass {
  constructor() {
    super(...arguments);
    __publicField(this, "colorRenderTarget", null);
    /**
     * The source render target to grab the color from.
     *
     * @type {RenderTarget|null}
     */
    __publicField(this, "source", null);
  }
  destroy() {
    super.destroy();
    this.releaseRenderTarget(this.colorRenderTarget);
  }
  shouldReallocate(targetRT, sourceTexture, sourceFormat) {
    const targetFormat = targetRT?.colorBuffer.format;
    if (targetFormat !== sourceFormat) {
      return true;
    }
    const width = sourceTexture?.width || this.device.width;
    const height = sourceTexture?.height || this.device.height;
    return !targetRT || width !== targetRT.width || height !== targetRT.height;
  }
  allocateRenderTarget(renderTarget, sourceRenderTarget, device, format) {
    const texture = new Texture(device, {
      name: _colorUniformName,
      format,
      width: sourceRenderTarget ? sourceRenderTarget.colorBuffer.width : device.width,
      height: sourceRenderTarget ? sourceRenderTarget.colorBuffer.height : device.height,
      mipmaps: true,
      minFilter: FILTER_LINEAR_MIPMAP_LINEAR,
      magFilter: FILTER_LINEAR,
      addressU: ADDRESS_CLAMP_TO_EDGE,
      addressV: ADDRESS_CLAMP_TO_EDGE
    });
    if (renderTarget) {
      renderTarget.destroyFrameBuffers();
      renderTarget._colorBuffer = texture;
      renderTarget._colorBuffers = [texture];
      renderTarget.evaluateDimensions();
    } else {
      renderTarget = new RenderTarget({
        name: "ColorGrabRT",
        colorBuffer: texture,
        depth: false,
        stencil: false,
        autoResolve: false
      });
    }
    return renderTarget;
  }
  releaseRenderTarget(rt) {
    if (rt) {
      rt.destroyTextureBuffers();
      rt.destroy();
    }
  }
  frameUpdate() {
    const device = this.device;
    const sourceRt = this.source;
    const sourceFormat = sourceRt?.colorBuffer.format ?? this.device.backBufferFormat;
    if (this.shouldReallocate(this.colorRenderTarget, sourceRt?.colorBuffer, sourceFormat)) {
      this.releaseRenderTarget(this.colorRenderTarget);
      this.colorRenderTarget = this.allocateRenderTarget(this.colorRenderTarget, sourceRt, device, sourceFormat);
    }
    const colorBuffer = this.colorRenderTarget.colorBuffer;
    device.scope.resolve(_colorUniformName).setValue(colorBuffer);
  }
  execute() {
    const device = this.device;
    DebugGraphics.pushGpuMarker(device, "GRAB-COLOR");
    const sourceRt = this.source;
    const colorBuffer = this.colorRenderTarget.colorBuffer;
    if (device.isWebGPU) {
      device.copyRenderTarget(sourceRt, this.colorRenderTarget, true, false);
      device.mipmapRenderer.generate(this.colorRenderTarget.colorBuffer.impl);
    } else {
      device.copyRenderTarget(sourceRt, this.colorRenderTarget, true, false);
      device.activeTexture(device.maxCombinedTextures - 1);
      device.bindTexture(colorBuffer);
      device.gl.generateMipmap(colorBuffer.impl._glTarget);
    }
    DebugGraphics.popGpuMarker(device);
  }
}
export {
  FramePassColorGrab
};
