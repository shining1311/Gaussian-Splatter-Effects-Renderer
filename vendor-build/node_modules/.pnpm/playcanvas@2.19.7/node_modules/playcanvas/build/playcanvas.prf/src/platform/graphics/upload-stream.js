class UploadStream {
	_deviceLostEvent = null;
	constructor(device, useSingleBuffer = false) {
		this.device = device;
		this.useSingleBuffer = useSingleBuffer;
		this.impl = device.createUploadStreamImpl(this);
		this._deviceLostEvent = this.device.on("devicelost", this._onDeviceLost, this);
	}
	destroy() {
		this._deviceLostEvent?.off();
		this._deviceLostEvent = null;
		this.impl?.destroy();
		this.impl = null;
	}
	upload(data, target, offset = 0, size = data.length) {
		this.impl?.upload(data, target, offset, size);
	}
	_onDeviceLost() {
		this.impl?._onDeviceLost?.();
	}
}
export {
	UploadStream
};
