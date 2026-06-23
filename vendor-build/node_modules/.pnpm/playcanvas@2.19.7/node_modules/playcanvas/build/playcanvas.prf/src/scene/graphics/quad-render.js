import { Vec4 } from "../../core/math/vec4.js";
import { BindGroup, DynamicBindGroup } from "../../platform/graphics/bind-group.js";
import { BINDGROUP_MESH, BINDGROUP_MESH_UB, BINDGROUP_VIEW, PRIMITIVE_TRIANGLES } from "../../platform/graphics/constants.js";
import { ShaderProcessorOptions } from "../../platform/graphics/shader-processor-options.js";
import { UniformBuffer } from "../../platform/graphics/uniform-buffer.js";
import { ShaderUtils } from "../shader-lib/shader-utils.js";
const _quadPrimitive = {
	type: PRIMITIVE_TRIANGLES,
	base: 0,
	count: 6,
	indexed: true
};
const _tempViewport = new Vec4();
const _tempScissor = new Vec4();
const _dynamicBindGroup = new DynamicBindGroup();
class QuadRender {
	uniformBuffer;
	bindGroup;
	constructor(shader) {
		const device = shader.device;
		this.shader = shader;
		if (device.supportsUniformBuffers) {
			const processingOptions = new ShaderProcessorOptions();
			this.shader = ShaderUtils.processShader(shader, processingOptions);
			const ubFormat = this.shader.meshUniformBufferFormat;
			if (ubFormat) {
				this.uniformBuffer = new UniformBuffer(device, ubFormat, false);
			}
			const bindGroupFormat = this.shader.meshBindGroupFormat;
			this.bindGroup = new BindGroup(device, bindGroupFormat);
		}
	}
	destroy() {
		this.uniformBuffer?.destroy();
		this.uniformBuffer = null;
		this.bindGroup?.destroy();
		this.bindGroup = null;
	}
	render(viewport, scissor, numInstances) {
		const device = this.shader.device;
		if (viewport) {
			_tempViewport.set(device.vx, device.vy, device.vw, device.vh);
			_tempScissor.set(device.sx, device.sy, device.sw, device.sh);
			scissor = scissor ?? viewport;
			device.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);
			device.setScissor(scissor.x, scissor.y, scissor.z, scissor.w);
		}
		device.setVertexBuffer(device.quadVertexBuffer);
		const shader = this.shader;
		device.setShader(shader);
		if (device.supportsUniformBuffers) {
			device.setBindGroup(BINDGROUP_VIEW, device.emptyBindGroup);
			const bindGroup = this.bindGroup;
			bindGroup.update();
			device.setBindGroup(BINDGROUP_MESH, bindGroup);
			const uniformBuffer = this.uniformBuffer;
			if (uniformBuffer) {
				uniformBuffer.update(_dynamicBindGroup);
				device.setBindGroup(BINDGROUP_MESH_UB, _dynamicBindGroup.bindGroup, _dynamicBindGroup.offsets);
			} else {
				device.setBindGroup(BINDGROUP_MESH_UB, device.emptyBindGroup);
			}
		}
		device.draw(_quadPrimitive, device.quadIndexBuffer, numInstances);
		if (viewport) {
			device.setViewport(_tempViewport.x, _tempViewport.y, _tempViewport.z, _tempViewport.w);
			device.setScissor(_tempScissor.x, _tempScissor.y, _tempScissor.z, _tempScissor.w);
		}
	}
}
export {
	QuadRender
};
