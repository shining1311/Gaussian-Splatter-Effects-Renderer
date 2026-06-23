import { TRACEID_PIPELINELAYOUT_ALLOC } from "../../../core/constants.js";
let _layoutId = 0;
class WebgpuPipeline {
	constructor(device) {
		this.device = device;
	}
	// TODO: this could be cached using bindGroupKey
	getPipelineLayout(bindGroupFormats) {
		const bindGroupLayouts = [];
		bindGroupFormats.forEach((format) => {
			bindGroupLayouts.push(format.bindGroupLayout);
		});
		const desc = {
			bindGroupLayouts
		};
		_layoutId++;
		const pipelineLayout = this.device.wgpu.createPipelineLayout(desc);
		return pipelineLayout;
	}
}
export {
	WebgpuPipeline
};
