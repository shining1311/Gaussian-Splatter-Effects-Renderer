import { PRIMITIVE_TRIANGLES, SEMANTIC_POSITION } from "../constants.js";
import { BlendState } from "../blend-state.js";
import { DepthState } from "../depth-state.js";
import { RenderTarget } from "../render-target.js";
import { Shader } from "../shader.js";
import { ShaderDefinitionUtils } from "../shader-definition-utils.js";
import { Texture } from "../texture.js";
const _quadPrimitive = {
	type: PRIMITIVE_TRIANGLES,
	base: 0,
	count: 6,
	indexed: true
};
const vsSrc = `
	attribute vec2 vertex_position;
	varying vec2 pcTexCoord;
	void main() {
		gl_Position = vec4(vertex_position, 0.0, 1.0);
		pcTexCoord = vertex_position * 0.5 + 0.5;
	}
`;
const fsSrc = `
	uniform sampler2D pcSource;
	varying vec2 pcTexCoord;
	void main() {
		gl_FragColor = texture2D(pcSource, pcTexCoord);
	}
`;
class WebglXrMsaaCopy {
	_device;
	_shader = null;
	_scratchTex = null;
	_scratchRt = null;
	_sourceId = null;
	constructor(device) {
		this._device = device;
	}
	_getShader() {
		if (!this._shader) {
			const device = this._device;
			this._shader = new Shader(device, ShaderDefinitionUtils.createDefinition(device, {
				name: "XrMsaaCopy",
				attributes: { vertex_position: SEMANTIC_POSITION },
				vertexCode: vsSrc,
				fragmentCode: fsSrc
			}));
			this._sourceId = device.scope.resolve("pcSource");
		}
		return this._shader;
	}
	_ensureScratch(width, height) {
		const device = this._device;
		if (this._scratchTex && (this._scratchTex.width !== width || this._scratchTex.height !== height)) {
			this._scratchRt.destroy();
			this._scratchRt = null;
			this._scratchTex.destroy();
			this._scratchTex = null;
		}
		if (!this._scratchTex) {
			this._scratchTex = Texture.createDataTexture2D(device, "XrMsaaScratch", width, height, device.backBufferFormat);
			this._scratchRt = new RenderTarget({
				colorBuffer: this._scratchTex,
				depth: false,
				stencil: false
			});
		}
		if (!this._scratchRt.impl.initialized) {
			this._scratchRt.impl.init(device, this._scratchRt);
		}
	}
	copy(msaaReadFbo, xrDrawFbo, width, height) {
		this._ensureScratch(width, height);
		const device = this._device;
		const gl = device.gl;
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msaaReadFbo);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._scratchRt.impl._glFrameBuffer);
		gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
		device.setDrawStates(BlendState.NOBLEND, DepthState.NODEPTH);
		device.setFramebuffer(xrDrawFbo);
		device.setShader(this._getShader());
		device.clearVertexBuffer();
		device.setVertexBuffer(device.quadVertexBuffer);
		this._sourceId.setValue(this._scratchTex);
		const { vx, vy, vw, vh, sx, sy, sw, sh } = device;
		device.setViewport(0, 0, width, height);
		device.setScissor(0, 0, width, height);
		device.draw(_quadPrimitive, device.quadIndexBuffer);
		device.setViewport(vx, vy, vw, vh);
		device.setScissor(sx, sy, sw, sh);
		device.setFramebuffer(msaaReadFbo);
	}
	destroy() {
		this._shader?.destroy();
		this._shader = null;
		this._scratchRt?.destroy();
		this._scratchRt = null;
		this._scratchTex?.destroy();
		this._scratchTex = null;
		this._sourceId = null;
	}
}
export {
	WebglXrMsaaCopy
};
