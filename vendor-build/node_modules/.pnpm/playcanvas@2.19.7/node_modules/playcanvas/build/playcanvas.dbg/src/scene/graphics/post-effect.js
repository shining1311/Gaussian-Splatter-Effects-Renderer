var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec4 } from "../../core/math/vec4.js";
import { BlendState } from "../../platform/graphics/blend-state.js";
import { drawQuadWithShader } from "./quad-render-utils.js";
const _viewport = new Vec4();
class PostEffect {
  /**
   * Create a new PostEffect instance.
   *
   * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.
   */
  constructor(graphicsDevice) {
    this.device = graphicsDevice;
    this.needsDepthBuffer = false;
  }
  /**
   * Render the post effect using the specified inputTarget to the specified outputTarget.
   *
   * @param {RenderTarget} inputTarget - The input render target.
   * @param {RenderTarget} outputTarget - The output render target. If null then this will be the
   * screen.
   * @param {Vec4} [rect] - The rect of the current camera. If not specified, it will default to
   * `[0, 0, 1, 1]`.
   */
  render(inputTarget, outputTarget, rect) {
  }
  /**
   * Draw a screen-space rectangle in a render target, using a specified shader.
   *
   * @param {RenderTarget|null} target - The output render target.
   * @param {Shader} shader - The shader to be used for drawing the rectangle.
   * @param {Vec4} [rect] - The normalized screen-space position (rect.x, rect.y) and size (rect.z,
   * rect.w) of the rectangle. Default is `[0, 0, 1, 1]`.
   */
  drawQuad(target, shader, rect) {
    let viewport;
    if (rect) {
      const w = target ? target.width : this.device.width;
      const h = target ? target.height : this.device.height;
      viewport = _viewport.set(rect.x * w, rect.y * h, rect.z * w, rect.w * h);
    }
    this.device.setBlendState(BlendState.NOBLEND);
    drawQuadWithShader(this.device, target, shader, viewport);
  }
}
/**
 * A simple vertex shader used to render a quad, which requires 'vec2 aPosition' in the vertex
 * buffer, and generates uv coordinates vUv0 for use in the fragment shader.
 *
 * @type {string}
 */
__publicField(PostEffect, "quadVertexShader", `
        attribute vec2 aPosition;
        varying vec2 vUv0;
        void main(void)
        {
            gl_Position = vec4(aPosition, 0.0, 1.0);
            vUv0 = getImageEffectUV((aPosition.xy + 1.0) * 0.5);
        }
    `);
export {
  PostEffect
};
