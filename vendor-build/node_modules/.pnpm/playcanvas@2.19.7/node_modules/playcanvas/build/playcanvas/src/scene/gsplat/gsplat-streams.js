import { Vec2 } from "../../core/math/vec2.js";
import { Texture } from "../../platform/graphics/texture.js";
import { TextureUtils } from "../../platform/graphics/texture-utils.js";
class GSplatStreams {
	device;
	format = null;
	textures = /* @__PURE__ */ new Map();
	_textureDimensions = new Vec2();
	_isInstance = false;
	_formatVersion = -1;
	get textureDimensions() {
		return this._textureDimensions;
	}
	constructor(device, isInstance = false) {
		this.device = device;
		this._isInstance = isInstance;
	}
	destroy() {
		for (const texture of this.textures.values()) {
			texture.destroy();
		}
		this.textures.clear();
	}
	init(format, numElements) {
		this.format = format;
		this._textureDimensions = TextureUtils.calcTextureSize(numElements, new Vec2());
		const streams = this._isInstance ? format.instanceStreams : format.resourceStreams;
		for (const stream of streams) {
			const texture = this.createTexture(stream.name, stream.format, this._textureDimensions);
			this.textures.set(stream.name, texture);
		}
		this._formatVersion = format.extraStreamsVersion;
	}
	getTexture(name) {
		this.syncWithFormat(this.format);
		return this.textures.get(name);
	}
	getTexturesInOrder() {
		const result = [];
		if (this.format) {
			const allStreams = this._isInstance ? this.format.instanceStreams : this.format.resourceStreams;
			for (const stream of allStreams) {
				const texture = this.textures.get(stream.name);
				if (texture) {
					result.push(texture);
				}
			}
		}
		return result;
	}
	syncWithFormat(format) {
		if (format) {
			if (this.format === format && this._formatVersion === format.extraStreamsVersion) {
				return;
			}
			this.format = format;
			const streams = this._isInstance ? format.instanceStreams : format.resourceStreams;
			for (const stream of streams) {
				if (!this.textures.has(stream.name)) {
					const texture = this.createTexture(stream.name, stream.format, this._textureDimensions);
					this.textures.set(stream.name, texture);
				}
			}
			this._formatVersion = format.extraStreamsVersion;
		}
	}
	resize(width, height) {
		this._textureDimensions.set(width, height);
		for (const texture of this.textures.values()) {
			texture.resize(width, height);
		}
	}
	createTexture(name, format, size, data) {
		return Texture.createDataTexture2D(this.device, name, size.x, size.y, format, data ? [data] : void 0);
	}
}
export {
	GSplatStreams
};
