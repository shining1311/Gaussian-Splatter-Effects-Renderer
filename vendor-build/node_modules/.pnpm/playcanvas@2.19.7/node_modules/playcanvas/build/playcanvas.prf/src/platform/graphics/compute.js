class ComputeParameter {
	value;
	scopeId = null;
}
class Compute {
	shader = null;
	name;
	parameters = /* @__PURE__ */ new Map();
	countX = 1;
	countY;
	countZ;
	indirectSlotIndex = -1;
	indirectBuffer = null;
	indirectFrameStamp = 0;
	constructor(graphicsDevice, shader, name = "Unnamed") {
		this.device = graphicsDevice;
		this.shader = shader;
		this.name = name;
		if (graphicsDevice.supportsCompute) {
			this.impl = graphicsDevice.createComputeImpl(this);
		}
	}
	setParameter(name, value) {
		let param = this.parameters.get(name);
		if (!param) {
			param = new ComputeParameter();
			param.scopeId = this.device.scope.resolve(name);
			this.parameters.set(name, param);
		}
		param.value = value;
	}
	getParameter(name) {
		return this.parameters.get(name)?.value;
	}
	deleteParameter(name) {
		this.parameters.delete(name);
	}
	destroy() {
		this.impl?.destroy();
		this.impl = null;
	}
	applyParameters() {
		for (const [, param] of this.parameters) {
			param.scopeId.setValue(param.value);
		}
	}
	setupDispatch(x, y, z) {
		this.countX = x;
		this.countY = y;
		this.countZ = z;
		this.indirectSlotIndex = -1;
		this.indirectBuffer = null;
	}
	setupIndirectDispatch(slotIndex, buffer = null) {
		this.indirectSlotIndex = slotIndex;
		this.indirectBuffer = buffer;
		this.indirectFrameStamp = this.device.renderVersion;
	}
	static calcDispatchSize(count, result, maxDimension = 65535) {
		if (count <= maxDimension) {
			return result.set(count, 1);
		}
		const y = Math.ceil(count / maxDimension);
		return result.set(Math.ceil(count / y), y);
	}
}
export {
	Compute
};
