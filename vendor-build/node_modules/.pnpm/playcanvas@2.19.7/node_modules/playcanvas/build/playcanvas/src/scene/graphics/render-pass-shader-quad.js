import { QuadRender } from "./quad-render.js";
import { BlendState } from "../../platform/graphics/blend-state.js";
import { CULLFACE_NONE, FRONTFACE_CCW } from "../../platform/graphics/constants.js";
import { DepthState } from "../../platform/graphics/depth-state.js";
import { RenderPass } from "../../platform/graphics/render-pass.js";
class RenderPassShaderQuad extends RenderPass {
	_shader = null;
	quadRender = null;
	cullMode = CULLFACE_NONE;
	frontFace = FRONTFACE_CCW;
	blendState = BlendState.NOBLEND;
	depthState = DepthState.NODEPTH;
	stencilFront = null;
	stencilBack = null;
	viewport;
	scissor;
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
