import { SEMANTIC_POSITION, SHADERLANGUAGE_GLSL, SHADERLANGUAGE_WGSL } from "../../platform/graphics/constants.js";
import { RenderPassShaderQuad } from "../../scene/graphics/render-pass-shader-quad.js";
import { ShaderUtils } from "../../scene/shader-lib/shader-utils.js";
import glslDownsamplePS from "../../scene/shader-lib/glsl/chunks/render-pass/frag/downsample.js";
import wgslDownsamplePS from "../../scene/shader-lib/wgsl/chunks/render-pass/frag/downsample.js";
import { ShaderChunks } from "../../scene/shader-lib/shader-chunks.js";
class RenderPassDownsample extends RenderPassShaderQuad {
	constructor(device, sourceTexture, options = {}) {
		super(device);
		this.sourceTexture = sourceTexture;
		this.premultiplyTexture = options.premultiplyTexture;
		ShaderChunks.get(device, SHADERLANGUAGE_GLSL).set("downsamplePS", glslDownsamplePS);
		ShaderChunks.get(device, SHADERLANGUAGE_WGSL).set("downsamplePS", wgslDownsamplePS);
		const boxFilter = options.boxFilter ?? false;
		const key = `${boxFilter ? "Box" : ""}-${options.premultiplyTexture ? "Premultiply" : ""}-${options.premultiplySrcChannel ?? ""}-${options.removeInvalid ? "RemoveInvalid" : ""}`;
		const defines = /* @__PURE__ */ new Map();
		if (boxFilter) defines.set("BOXFILTER", "");
		if (options.premultiplyTexture) defines.set("PREMULTIPLY", "");
		if (options.removeInvalid) defines.set("REMOVE_INVALID", "");
		defines.set("{PREMULTIPLY_SRC_CHANNEL}", options.premultiplySrcChannel ?? "x");
		this.shader = ShaderUtils.createShader(device, {
			uniqueName: `DownSampleShader:${key}`,
			attributes: { aPosition: SEMANTIC_POSITION },
			vertexChunk: "quadVS",
			fragmentChunk: "downsamplePS",
			fragmentDefines: defines
		});
		this.sourceTextureId = device.scope.resolve("sourceTexture");
		this.premultiplyTextureId = device.scope.resolve("premultiplyTexture");
		this.sourceInvResolutionId = device.scope.resolve("sourceInvResolution");
		this.sourceInvResolutionValue = new Float32Array(2);
	}
	setSourceTexture(value) {
		this._sourceTexture = value;
		this.options.resizeSource = value;
	}
	execute() {
		this.sourceTextureId.setValue(this.sourceTexture);
		if (this.premultiplyTexture) {
			this.premultiplyTextureId.setValue(this.premultiplyTexture);
		}
		this.sourceInvResolutionValue[0] = 1 / this.sourceTexture.width;
		this.sourceInvResolutionValue[1] = 1 / this.sourceTexture.height;
		this.sourceInvResolutionId.setValue(this.sourceInvResolutionValue);
		super.execute();
	}
}
export {
	RenderPassDownsample
};
