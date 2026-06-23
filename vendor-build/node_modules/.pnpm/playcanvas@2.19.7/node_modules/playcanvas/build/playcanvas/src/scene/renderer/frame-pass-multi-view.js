import { FramePass } from "../../platform/graphics/frame-pass.js";
class FramePassMultiView extends FramePass {
	children = [];
	constructor(graphicsDevice) {
		super(graphicsDevice);
		this.name = "FramePassMultiView";
	}
	addChild(pass) {
		this.children.push(pass);
	}
	render() {
		if (!this.enabled) return;
		const device = this.device;
		const subs = device.xrSubImages;
		const numViews = subs?.length ?? 0;
		const children = this.children;
		const childCount = children.length;
		if (numViews === 0) {
			for (let c = 0; c < childCount; c++) {
				children[c].render();
			}
			return;
		}
		const backBufferImpl = device.backBuffer?.impl;
		const savedXrColorTexture = device.xrColorTexture;
		const savedColorTexture = backBufferImpl?.assignedColorTexture ?? null;
		const savedViewFormat = backBufferImpl?.colorAttachments?.[0]?.format ?? null;
		for (let v = 0; v < numViews; v++) {
			const sub = subs[v];
			device.xrCurrentViewIndex = v;
			device.xrColorTexture = sub.colorTexture;
			device.xrColorTextureViewDescriptor = sub.viewDescriptor;
			backBufferImpl?.assignColorTexture?.(sub.colorTexture, sub.viewFormat);
			for (let c = 0; c < childCount; c++) {
				children[c].render();
			}
		}
		device.xrCurrentViewIndex = -1;
		device.xrColorTextureViewDescriptor = null;
		device.xrColorTexture = savedXrColorTexture ?? null;
		if (backBufferImpl && savedColorTexture && savedViewFormat && backBufferImpl.assignedColorTexture !== savedColorTexture) {
			backBufferImpl.assignColorTexture(savedColorTexture, savedViewFormat);
		}
	}
}
export {
	FramePassMultiView
};
