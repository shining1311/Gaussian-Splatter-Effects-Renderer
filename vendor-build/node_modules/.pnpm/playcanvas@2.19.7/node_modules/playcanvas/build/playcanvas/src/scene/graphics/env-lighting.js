import { Vec4 } from "../../core/math/vec4.js";
import { Texture } from "../../platform/graphics/texture.js";
import { reprojectTexture } from "./reproject-texture.js";
import {
	TEXTURETYPE_DEFAULT,
	TEXTURETYPE_RGBP as RGBA8_TYPE,
	TEXTUREPROJECTION_EQUIRECT,
	ADDRESS_CLAMP_TO_EDGE,
	PIXELFORMAT_RGBA8,
	PIXELFORMAT_RGBA16F,
	PIXELFORMAT_RGBA32F
} from "../../platform/graphics/constants.js";
const calcLevels = (width, height = 0) => {
	return 1 + Math.floor(Math.log2(Math.max(width, height)));
};
const supportsFloat16 = (device) => {
	return device.textureHalfFloatRenderable;
};
const supportsFloat32 = (device) => {
	return device.textureFloatRenderable;
};
const lightingSourcePixelFormat = (device) => {
	return supportsFloat16(device) ? PIXELFORMAT_RGBA16F : supportsFloat32(device) ? PIXELFORMAT_RGBA32F : PIXELFORMAT_RGBA8;
};
const lightingPixelFormat = (device) => {
	return PIXELFORMAT_RGBA8;
};
const createCubemap = (device, size, format, mipmaps) => {
	return new Texture(device, {
		name: `lighting-${size}`,
		cubemap: true,
		width: size,
		height: size,
		format,
		type: format === PIXELFORMAT_RGBA8 ? RGBA8_TYPE : TEXTURETYPE_DEFAULT,
		addressU: ADDRESS_CLAMP_TO_EDGE,
		addressV: ADDRESS_CLAMP_TO_EDGE,
		mipmaps: !!mipmaps
	});
};
class EnvLighting {
	static generateSkyboxCubemap(source, size) {
		const device = source.device;
		const result = createCubemap(device, size || (source.cubemap ? source.width : source.width / 4), PIXELFORMAT_RGBA8, false);
		reprojectTexture(source, result, {
			numSamples: 1024
		});
		return result;
	}
	static generateLightingSource(source, options) {
		const device = source.device;
		const format = lightingSourcePixelFormat(device);
		const result = options?.target || new Texture(device, {
			name: "lighting-source",
			cubemap: true,
			width: options?.size || 128,
			height: options?.size || 128,
			format,
			type: format === PIXELFORMAT_RGBA8 ? RGBA8_TYPE : TEXTURETYPE_DEFAULT,
			addressU: ADDRESS_CLAMP_TO_EDGE,
			addressV: ADDRESS_CLAMP_TO_EDGE,
			mipmaps: true
		});
		reprojectTexture(source, result, {
			numSamples: source.mipmaps ? 1 : 1024
		});
		return result;
	}
	static generateAtlas(source, options) {
		const device = source.device;
		const format = lightingPixelFormat(device);
		const result = options?.target || new Texture(device, {
			name: "envAtlas",
			width: options?.size || 512,
			height: options?.size || 512,
			format,
			type: format === PIXELFORMAT_RGBA8 ? RGBA8_TYPE : TEXTURETYPE_DEFAULT,
			projection: TEXTUREPROJECTION_EQUIRECT,
			addressU: ADDRESS_CLAMP_TO_EDGE,
			addressV: ADDRESS_CLAMP_TO_EDGE,
			mipmaps: false
		});
		const s = result.width / 512;
		const rect = new Vec4(0, 0, 512 * s, 256 * s);
		const levels = calcLevels(256) - calcLevels(4);
		for (let i = 0; i < levels; ++i) {
			reprojectTexture(source, result, {
				numSamples: 1,
				rect,
				seamPixels: s
			});
			rect.x += rect.w;
			rect.y += rect.w;
			rect.z = Math.max(1, Math.floor(rect.z * 0.5));
			rect.w = Math.max(1, Math.floor(rect.w * 0.5));
		}
		rect.set(0, 256 * s, 256 * s, 128 * s);
		for (let i = 1; i < 7; ++i) {
			reprojectTexture(source, result, {
				numSamples: options?.numReflectionSamples || 1024,
				distribution: options?.distribution || "ggx",
				specularPower: Math.max(1, 2048 >> i * 2),
				rect,
				seamPixels: s
			});
			rect.y += rect.w;
			rect.z = Math.max(1, Math.floor(rect.z * 0.5));
			rect.w = Math.max(1, Math.floor(rect.w * 0.5));
		}
		rect.set(128 * s, (256 + 128) * s, 64 * s, 32 * s);
		reprojectTexture(source, result, {
			numSamples: options?.numAmbientSamples || 2048,
			distribution: "lambert",
			rect,
			seamPixels: s
		});
		return result;
	}
	static generatePrefilteredAtlas(sources, options) {
		const device = sources[0].device;
		const format = sources[0].format;
		const type = sources[0].type;
		const result = options?.target || new Texture(device, {
			name: "envPrefilteredAtlas",
			width: options?.size || 512,
			height: options?.size || 512,
			format,
			type,
			projection: TEXTUREPROJECTION_EQUIRECT,
			addressU: ADDRESS_CLAMP_TO_EDGE,
			addressV: ADDRESS_CLAMP_TO_EDGE,
			mipmaps: false
		});
		const s = result.width / 512;
		const rect = new Vec4(0, 0, 512 * s, 256 * s);
		const levels = calcLevels(512);
		for (let i = 0; i < levels; ++i) {
			reprojectTexture(sources[0], result, {
				numSamples: 1,
				rect,
				seamPixels: s
			});
			rect.x += rect.w;
			rect.y += rect.w;
			rect.z = Math.max(1, Math.floor(rect.z * 0.5));
			rect.w = Math.max(1, Math.floor(rect.w * 0.5));
		}
		rect.set(0, 256 * s, 256 * s, 128 * s);
		for (let i = 1; i < sources.length; ++i) {
			reprojectTexture(sources[i], result, {
				numSamples: 1,
				rect,
				seamPixels: s
			});
			rect.y += rect.w;
			rect.z = Math.max(1, Math.floor(rect.z * 0.5));
			rect.w = Math.max(1, Math.floor(rect.w * 0.5));
		}
		rect.set(128 * s, (256 + 128) * s, 64 * s, 32 * s);
		if (options?.legacyAmbient) {
			reprojectTexture(sources[5], result, {
				numSamples: 1,
				rect,
				seamPixels: s
			});
		} else {
			reprojectTexture(sources[0], result, {
				numSamples: options?.numSamples || 2048,
				distribution: "lambert",
				rect,
				seamPixels: s
			});
		}
		return result;
	}
}
export {
	EnvLighting
};
