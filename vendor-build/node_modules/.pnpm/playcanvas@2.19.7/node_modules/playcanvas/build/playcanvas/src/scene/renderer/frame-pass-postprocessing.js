import { FramePass } from "../../platform/graphics/frame-pass.js";
class FramePassPostprocessing extends FramePass {
	constructor(device, renderer, renderAction) {
		super(device);
		this.renderer = renderer;
		this.renderAction = renderAction;
	}
	execute() {
		const renderAction = this.renderAction;
		const camera = renderAction.camera;
		camera.onPostprocessing();
	}
}
export {
	FramePassPostprocessing
};
