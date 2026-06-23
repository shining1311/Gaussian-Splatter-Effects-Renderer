var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { QuadRender } from "./quad-render.js";
import { BlendState } from "../../platform/graphics/blend-state.js";
import { CULLFACE_NONE, FRONTFACE_CCW } from "../../platform/graphics/constants.js";
import { DepthState } from "../../platform/graphics/depth-state.js";
import { RenderPass } from "../../platform/graphics/render-pass.js";
class RenderPassShaderQuad extends RenderPass {
  constructor() {
    super(...arguments);
    /**
     * @type {Shader|null}
     */
    __publicField(this, "_shader", null);
    /**
     * @type {QuadRender|null}
     */
    __publicField(this, "quadRender", null);
    /**
     * The cull mode to use when rendering the quad. Defaults to {@link CULLFACE_NONE}.
     */
    __publicField(this, "cullMode", CULLFACE_NONE);
    /**
     * The front face to use when rendering the quad. Defaults to {@link FRONTFACE_CCW}.
     */
    __publicField(this, "frontFace", FRONTFACE_CCW);
    /**
     * A blend state to use when rendering the quad. Defaults to {@link BlendState.NOBLEND}.
     *
     * @type {BlendState}
     */
    __publicField(this, "blendState", BlendState.NOBLEND);
    /**
     * A depth state to use when rendering the quad. Defaults to {@link DepthState.NODEPTH}.
     *
     * @type {DepthState}
     */
    __publicField(this, "depthState", DepthState.NODEPTH);
    /**
     * Stencil parameters for front faces to use when rendering the quad. Defaults to null.
     *
     * @type {StencilParameters|null}
     */
    __publicField(this, "stencilFront", null);
    /**
     * Stencil parameters for back faces to use when rendering the quad. Defaults to null.
     *
     * @type {StencilParameters|null}
     */
    __publicField(this, "stencilBack", null);
    /**
     * Optional viewport rectangle (x, y, width, height). If set, the quad renders only to this
     * region and the original viewport is restored after rendering.
     *
     * @type {Vec4|undefined}
     */
    __publicField(this, "viewport");
    /**
     * Optional scissor rectangle (x, y, width, height). If set, pixels outside this region are
     * discarded. Only used when viewport is also set. Defaults to the viewport if not specified.
     *
     * @type {Vec4|undefined}
     */
    __publicField(this, "scissor");
  }
  /**
   * Sets the shader used to render the quad.
   *
   * @type {Shader}
   * @ignore
   */
  set shader(shader) {
    this.quadRender?.destroy();
    this.quadRender = null;
    this._shader = shader;
    if (shader) {
      this.quadRender = new QuadRender(shader);
    }
  }
  get shader() {
    return this._shader;
  }
  execute() {
    this.device.setDrawStates(this.blendState, this.depthState, this.cullMode, this.frontFace, this.stencilFront, this.stencilBack);
    this.quadRender?.render(this.viewport, this.scissor);
  }
}
export {
  RenderPassShaderQuad
};
