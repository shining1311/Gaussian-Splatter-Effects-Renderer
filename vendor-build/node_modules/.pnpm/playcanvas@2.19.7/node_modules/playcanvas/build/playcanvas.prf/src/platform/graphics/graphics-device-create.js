import { DEVICETYPE_WEBGL2, DEVICETYPE_WEBGPU, DEVICETYPE_WEBGPU_BARE, DEVICETYPE_NULL } from "./constants.js";
import { WebgpuGraphicsDevice } from "./webgpu/webgpu-graphics-device.js";
import { WebglGraphicsDevice } from "./webgl/webgl-graphics-device.js";
import { NullGraphicsDevice } from "./null/null-graphics-device.js";
function createGraphicsDevice(canvas, options = {}) {
	const deviceTypes = options.deviceTypes ?? [];
	if (!deviceTypes.includes(DEVICETYPE_WEBGL2)) {
		deviceTypes.push(DEVICETYPE_WEBGL2);
	}
	if (!deviceTypes.includes(DEVICETYPE_NULL)) {
		deviceTypes.push(DEVICETYPE_NULL);
	}
	const deviceCreateFuncs = [];
	for (let i = 0; i < deviceTypes.length; i++) {
		const deviceType = deviceTypes[i];
		if ((deviceType === DEVICETYPE_WEBGPU || deviceType === DEVICETYPE_WEBGPU_BARE) && window?.navigator?.gpu) {
			const featureLevel = deviceType === DEVICETYPE_WEBGPU_BARE ? "bare" : void 0;
			deviceCreateFuncs.push(() => {
				const device = new WebgpuGraphicsDevice(canvas, { ...options, featureLevel });
				return device.initWebGpu(options.glslangUrl, options.twgslUrl);
			});
		}
		if (deviceType === DEVICETYPE_WEBGL2) {
			deviceCreateFuncs.push(() => {
				return new WebglGraphicsDevice(canvas, options);
			});
		}
		if (deviceType === DEVICETYPE_NULL) {
			deviceCreateFuncs.push(() => {
				return new NullGraphicsDevice(canvas, options);
			});
		}
	}
	return new Promise((resolve, reject) => {
		let attempt = 0;
		const next = () => {
			if (attempt >= deviceCreateFuncs.length) {
				reject(new Error("Failed to create a graphics device"));
			} else {
				Promise.resolve(deviceCreateFuncs[attempt++]()).then((device) => {
					if (device) {
						resolve(device);
					} else {
						next();
					}
				}).catch((err) => {
					console.log(err);
					next();
				});
			}
		};
		next();
	});
}
export {
	createGraphicsDevice
};
