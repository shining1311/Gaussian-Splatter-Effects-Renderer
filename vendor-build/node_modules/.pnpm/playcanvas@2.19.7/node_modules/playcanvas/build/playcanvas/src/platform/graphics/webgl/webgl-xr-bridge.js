import { PIXELFORMAT_DEPTH, PIXELFORMAT_R32F } from "../constants.js";
class WebglXrBridge {
	_presentationLayer = null;
	_graphicsBinding = null;
	_cameraFbSource = null;
	_cameraFbDest = null;
	constructor(xrBridge) {
		this.xrBridge = xrBridge;
	}
	destroy(device) {
		this._graphicsBinding = null;
		this._presentationLayer = null;
		this._deleteCameraFramebuffers(device);
	}
	_deleteCameraFramebuffers(device) {
		if (this._cameraFbSource) {
			const gl = device.gl;
			gl.deleteFramebuffer(this._cameraFbSource);
			this._cameraFbSource = null;
			gl.deleteFramebuffer(this._cameraFbDest);
			this._cameraFbDest = null;
		}
	}
	beginFrame(frame, _referenceSpace) {
		const baseLayer = frame.session.renderState.baseLayer;
		this.xrBridge.device.defaultFramebuffer = baseLayer ? baseLayer.framebuffer : null;
	}
	endFrame() {
		this.xrBridge.device.defaultFramebuffer = null;
	}
	get presentationLayer() {
		return this._presentationLayer;
	}
	get graphicsBinding() {
		return this._graphicsBinding;
	}
	getFramebufferSize(frame, out) {
		const baseLayer = frame.session.renderState.baseLayer;
		if (!baseLayer) {
			out.set(0, 0);
			return;
		}
		out.set(baseLayer.framebufferWidth, baseLayer.framebufferHeight);
	}
	getViewport(frame, xrView) {
		const baseLayer = frame.session.renderState.baseLayer;
		if (!baseLayer) {
			return { x: 0, y: 0, width: 0, height: 0 };
		}
		return baseLayer.getViewport(xrView);
	}
	attachPresentation(session, options) {
		const device = this.xrBridge.device;
		this._presentationLayer = new XRWebGLLayer(session, device.gl, {
			alpha: true,
			depth: true,
			stencil: true,
			framebufferScaleFactor: options.framebufferScaleFactor,
			antialias: false
		});
		if (window.XRWebGLBinding) {
			try {
				this._graphicsBinding = new XRWebGLBinding(session, device.gl);
			} catch (ex) {
				this.xrBridge._onBindingError?.(ex);
			}
		}
		session.updateRenderState({
			baseLayer: this._presentationLayer,
			depthNear: options.depthNear,
			depthFar: options.depthFar
		});
	}
	releasePresentation() {
		this._graphicsBinding = null;
	}
	syncCameraColorTexture(xrCamera, texture) {
		if (!this._graphicsBinding) {
			return;
		}
		const device = this.xrBridge.device;
		const gl = device.gl;
		const src = this._graphicsBinding.getCameraImage(xrCamera);
		if (!src) {
			return;
		}
		if (!this._cameraFbSource) {
			this._cameraFbSource = gl.createFramebuffer();
			this._cameraFbDest = gl.createFramebuffer();
		}
		const width = xrCamera.width;
		const height = xrCamera.height;
		device.setFramebuffer(this._cameraFbSource);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, src, 0);
		device.setFramebuffer(this._cameraFbDest);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.impl._glTexture, 0);
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._cameraFbSource);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._cameraFbDest);
		gl.blitFramebuffer(0, height, width, 0, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
		device.setFramebuffer(device.defaultFramebuffer);
	}
	syncCameraDepthTexture(depthInfo, texture, depthPixelFormat) {
		if (!depthInfo?.texture) {
			return;
		}
		const gl = this.xrBridge.device.gl;
		texture.impl._glTexture = depthInfo.texture;
		if (depthInfo.textureType === "texture-array") {
			texture.impl._glTarget = gl.TEXTURE_2D_ARRAY;
		} else {
			texture.impl._glTarget = gl.TEXTURE_2D;
		}
		switch (depthPixelFormat) {
			case PIXELFORMAT_R32F:
				texture.impl._glInternalFormat = gl.R32F;
				texture.impl._glPixelType = gl.FLOAT;
				texture.impl._glFormat = gl.RED;
				break;
			case PIXELFORMAT_DEPTH:
				texture.impl._glInternalFormat = gl.DEPTH_COMPONENT16;
				texture.impl._glPixelType = gl.UNSIGNED_SHORT;
				texture.impl._glFormat = gl.DEPTH_COMPONENT;
				break;
		}
		texture.impl._glCreated = true;
	}
	onGraphicsDeviceLost() {
		const session = this.xrBridge._session;
		if (!session) {
			return;
		}
		const rs = session.renderState;
		this._graphicsBinding = null;
		this._presentationLayer = null;
		this._cameraFbSource = null;
		this._cameraFbDest = null;
		session.updateRenderState({
			baseLayer: this._presentationLayer,
			depthNear: rs.depthNear,
			depthFar: rs.depthFar
		});
	}
	onGraphicsDeviceRestored() {
		const bridge = this.xrBridge;
		if (!bridge._session) {
			return;
		}
		const device = bridge.device;
		const eventHandler = bridge.eventHandler;
		setTimeout(() => {
			if (!bridge._session) {
				return;
			}
			device.gl.makeXRCompatible().then(() => {
				if (!bridge._session) {
					return;
				}
				const rs = bridge._session.renderState;
				bridge.attachPresentation(bridge._session, {
					framebufferScaleFactor: bridge._framebufferScaleFactor,
					depthNear: rs.depthNear,
					depthFar: rs.depthFar,
					onBindingError: bridge._onBindingError
				});
			}).catch((ex) => {
				eventHandler.fire("error", ex);
			});
		}, 0);
	}
}
export {
	WebglXrBridge
};
