var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug, DebugHelper } from "../../core/debug.js";
import { Vec4 } from "../../core/math/vec4.js";
import { BindGroup, DynamicBindGroup } from "../../platform/graphics/bind-group.js";
import { BINDGROUP_MESH, BINDGROUP_MESH_UB, BINDGROUP_VIEW, PRIMITIVE_TRIANGLES } from "../../platform/graphics/constants.js";
import { DebugGraphics } from "../../platform/graphics/debug-graphics.js";
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
  /**
   * Create a new QuadRender instance.
   *
   * @param {Shader} shader - The shader to be used to render the quad.
   */
  constructor(shader) {
    /**
     * @type {UniformBuffer}
     * @ignore
     */
    __publicField(this, "uniformBuffer");
    /**
     * @type {BindGroup}
     * @ignore
     */
    __publicField(this, "bindGroup");
    const device = shader.device;
    this.shader = shader;
    Debug.assert(shader);
    if (device.supportsUniformBuffers) {
      const processingOptions = new ShaderProcessorOptions();
      this.shader = ShaderUtils.processShader(shader, processingOptions);
      const ubFormat = this.shader.meshUniformBufferFormat;
      if (ubFormat) {
        this.uniformBuffer = new UniformBuffer(device, ubFormat, false);
      }
      const bindGroupFormat = this.shader.meshBindGroupFormat;
      Debug.assert(bindGroupFormat);
      this.bindGroup = new BindGroup(device, bindGroupFormat);
      DebugHelper.setName(this.bindGroup, `QuadRender-MeshBindGroup_${this.bindGroup.id}`);
    }
  }
  /**
   * Destroys the resources associated with this instance.
   */
  destroy() {
    this.uniformBuffer?.destroy();
    this.uniformBuffer = null;
    this.bindGroup?.destroy();
    this.bindGroup = null;
  }
  /**
   * Renders the quad. If the viewport is provided, the original viewport and scissor is restored
   * after the rendering.
   *
   * @param {Vec4} [viewport] - The viewport rectangle of the quad, in pixels. The viewport is
   * not changed if not provided.
   * @param {Vec4} [scissor] - The scissor rectangle of the quad, in pixels. Used only if the
   * viewport is provided.
   * @param {number} [numInstances] - Number of instances to draw. When provided, renders
   * multiple quads using instanced drawing. Each instance can use the instance index
   * (`gl_InstanceID` in GLSL, `pcInstanceIndex` in WGSL) to fetch per-quad data from
   * a texture or buffer, allowing each quad to be parameterized independently.
   */
  render(viewport, scissor, numInstances) {
    const device = this.shader.device;
    DebugGraphics.pushGpuMarker(device, "QuadRender");
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
    DebugGraphics.popGpuMarker(device);
  }
}
export {
  QuadRender
};
