import { RenderPass } from "../../platform/graphics/render-pass.js";
class RenderPassQuad extends RenderPass {
	constructor(device, quad, rect, scissorRect) {
		super(device);
		this.quad = quad;
		this.rect = rect;
		this.scissorRect = scissorRect;
	}
	execute() {
		const { device } = this;
		device.setDrawStates(device.blendState);
		this.quad.render(this.rect, this.scissorRect);
	}
}
export {
	RenderPassQuad
};
