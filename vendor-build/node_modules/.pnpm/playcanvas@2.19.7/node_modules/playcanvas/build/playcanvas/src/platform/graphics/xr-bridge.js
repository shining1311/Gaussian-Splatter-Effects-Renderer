class XrBridge {
	device;
	eventHandler;
	impl;
	_evtDeviceLost = null;
	_evtDeviceRestored = null;
	_session = null;
	_framebufferScaleFactor = 1;
	_onBindingError;
	constructor(device, eventHandler) {
		this.device = device;
		this.eventHandler = eventHandler;
		this.impl = device.createXrBridgeImpl(this);
		this._evtDeviceLost = device.on("devicelost", this._onDeviceLost, this);
		this._evtDeviceRestored = device.on("devicerestored", this._onDeviceRestored, this);
	}
	destroy() {
		const device = this.device;
		if (device) {
			this._evtDeviceLost?.off();
			this._evtDeviceLost = null;
			this._evtDeviceRestored?.off();
			this._evtDeviceRestored = null;
			this.impl.endFrame();
			this.impl.destroy(device);
			this.impl = null;
			this._session = null;
			this._framebufferScaleFactor = 1;
			this._onBindingError = void 0;
			this.device = null;
			this.eventHandler = null;
		}
	}
	_onDeviceLost() {
		this.impl.onGraphicsDeviceLost();
	}
	_onDeviceRestored() {
		this.impl.onGraphicsDeviceRestored();
	}
	attachPresentation(session, options) {
		this._session = session;
		this._framebufferScaleFactor = options.framebufferScaleFactor;
		this._onBindingError = options.onBindingError;
		this.impl.attachPresentation(session, options);
	}
	releasePresentation() {
		this.impl.releasePresentation();
	}
	beginFrame(frame, referenceSpace) {
		this.impl.beginFrame(frame, referenceSpace);
	}
	endFrame() {
		this.impl.endFrame();
	}
	getFramebufferSize(frame, out) {
		this.impl.getFramebufferSize(frame, out);
	}
	getViewport(frame, xrView) {
		return this.impl.getViewport(frame, xrView);
	}
	syncCameraColorTexture(xrCamera, texture) {
		this.impl?.syncCameraColorTexture?.(xrCamera, texture);
	}
	syncCameraDepthTexture(depthInfo, texture, depthPixelFormat) {
		this.impl?.syncCameraDepthTexture?.(depthInfo, texture, depthPixelFormat);
	}
	get presentationLayer() {
		return this.impl.presentationLayer ?? null;
	}
	get graphicsBinding() {
		return this.impl.graphicsBinding ?? null;
	}
}
export {
	XrBridge
};
