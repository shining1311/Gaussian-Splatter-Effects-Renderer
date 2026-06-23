import { Vec2 } from "../../core/math/vec2.js";
import {
	PIXELFORMAT_RGBA32F,
	PIXELFORMAT_RGBA32U
} from "../../platform/graphics/constants.js";
import { GSplatResourceBase } from "./gsplat-resource-base.js";
import { GSplatFormat } from "./gsplat-format.js";
const strideCopy = (target, targetStride, src, srcStride, numEntries) => {
	for (let i = 0; i < numEntries; ++i) {
		for (let j = 0; j < srcStride; ++j) {
			target[i * targetStride + j] = src[i * srcStride + j];
		}
	}
};
class GSplatCompressedResource extends GSplatResourceBase {
	constructor(device, gsplatData, options = {}) {
		super(device, gsplatData, options);
		const { chunkData, chunkSize, numChunks, numSplats, vertexData, shBands } = gsplatData;
		this.chunks = new Float32Array(numChunks * 6);
		gsplatData.getChunks(this.chunks);
		const formatStreams = [
			{ name: "packedTexture", format: PIXELFORMAT_RGBA32U }
		];
		if (shBands > 0) {
			formatStreams.push({ name: "shTexture0", format: PIXELFORMAT_RGBA32U });
			formatStreams.push({ name: "shTexture1", format: PIXELFORMAT_RGBA32U });
			formatStreams.push({ name: "shTexture2", format: PIXELFORMAT_RGBA32U });
		}
		this._format = new GSplatFormat(device, formatStreams, {
			readGLSL: '#include "gsplatCompressedVS"',
			readWGSL: '#include "gsplatCompressedVS"'
		});
		this.streams.init(this.format, numSplats);
		const packedTexture = this.streams.getTexture("packedTexture");
		const packedData = packedTexture.lock();
		packedData.set(vertexData);
		packedTexture.unlock();
		if (shBands > 0) {
			const shTexture0 = this.streams.getTexture("shTexture0");
			const shTexture1 = this.streams.getTexture("shTexture1");
			const shTexture2 = this.streams.getTexture("shTexture2");
			const sh0Data = shTexture0.lock();
			sh0Data.set(new Uint32Array(gsplatData.shData0.buffer));
			shTexture0.unlock();
			const sh1Data = shTexture1.lock();
			sh1Data.set(new Uint32Array(gsplatData.shData1.buffer));
			shTexture1.unlock();
			const sh2Data = shTexture2.lock();
			sh2Data.set(new Uint32Array(gsplatData.shData2.buffer));
			shTexture2.unlock();
		}
		const chunkTextureSize = this.evalChunkTextureSize(numChunks);
		const chunkTexture = this.streams.createTexture("chunkTexture", PIXELFORMAT_RGBA32F, chunkTextureSize);
		this.streams.textures.set("chunkTexture", chunkTexture);
		const chunkTextureData = chunkTexture.lock();
		strideCopy(chunkTextureData, 20, chunkData, chunkSize, numChunks);
		if (chunkSize === 12) {
			for (let i = 0; i < numChunks; ++i) {
				chunkTextureData[i * 20 + 15] = 1;
				chunkTextureData[i * 20 + 16] = 1;
				chunkTextureData[i * 20 + 17] = 1;
			}
		}
		chunkTexture.unlock();
	}
	destroy() {
		super.destroy();
	}
	configureMaterialDefines(defines) {
		defines.set("SH_BANDS", this.streams.textures.has("shTexture0") ? 3 : 0);
	}
	evalChunkTextureSize(numChunks) {
		const width = Math.ceil(Math.sqrt(numChunks));
		const height = Math.ceil(numChunks / width);
		return new Vec2(width * 5, height);
	}
}
export {
	GSplatCompressedResource
};
