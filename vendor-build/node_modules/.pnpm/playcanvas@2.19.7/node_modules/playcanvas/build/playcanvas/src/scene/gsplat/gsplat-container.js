import { math } from "../../core/math/math.js";
import { BoundingBox } from "../../core/shape/bounding-box.js";
import { GSplatResourceBase } from "./gsplat-resource-base.js";
class GSplatContainer extends GSplatResourceBase {
	_maxSplats = 0;
	_numSplats = 0;
	constructor(device, maxSplats, format) {
		const aabb = new BoundingBox();
		const gsplatData = {
			numSplats: maxSplats,
			getCenters: () => null,
			calcAabb: (box) => box.copy(aabb)
		};
		super(device, gsplatData, { prepareCenters: false });
		this._format = format;
		this._maxSplats = maxSplats;
		this._numSplats = maxSplats;
		this.streams.init(this._format, maxSplats);
	}
	set centers(value) {
		this._centers = value;
	}
	get centers() {
		if (this._centers === null) {
			this._centers = new Float32Array(this._maxSplats * 3);
			this.centersVersion++;
		}
		return this._centers;
	}
	get maxSplats() {
		return this._maxSplats;
	}
	get numSplats() {
		return this._numSplats;
	}
	update(numSplats = this._numSplats, centersUpdated = true) {
		this._numSplats = math.clamp(numSplats, 0, this._maxSplats);
		if (centersUpdated) {
			this.centersVersion++;
		}
	}
	configureMaterialDefines(defines) {
		defines.set("SH_BANDS", "0");
	}
	configureMaterial(material, workBufferModifier = null, formatDeclarations) {
		super.configureMaterial(material, workBufferModifier, formatDeclarations);
		const chunks = this.device.isWebGPU ? material.shaderChunks.wgsl : material.shaderChunks.glsl;
		chunks.set("gsplatContainerDeclarationsVS", this.format.getInputDeclarations());
		chunks.set("gsplatDeclarationsVS", '#include "gsplatContainerDeclVS"');
		chunks.set("gsplatReadVS", this.format.getReadCode());
	}
}
export {
	GSplatContainer
};
