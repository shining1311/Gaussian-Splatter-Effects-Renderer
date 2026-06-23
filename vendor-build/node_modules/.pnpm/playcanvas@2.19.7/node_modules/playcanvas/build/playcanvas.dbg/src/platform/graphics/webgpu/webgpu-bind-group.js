var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug, DebugHelper } from "../../../core/debug.js";
import { WebgpuDebug } from "./webgpu-debug.js";
import { TextureView } from "../texture-view.js";
class WebgpuBindGroup {
  constructor() {
    /**
     * @type {GPUBindGroup}
     * @private
     */
    __publicField(this, "bindGroup");
  }
  update(bindGroup) {
    this.destroy();
    const device = bindGroup.device;
    const desc = this.createDescriptor(device, bindGroup);
    WebgpuDebug.validate(device);
    this.bindGroup = device.wgpu.createBindGroup(desc);
    WebgpuDebug.end(device, "BindGroup creation", {
      debugFormat: this.debugFormat,
      desc,
      format: bindGroup.format,
      bindGroup
    });
  }
  destroy() {
    this.bindGroup = null;
  }
  /**
   * Creates a bind group descriptor in WebGPU format
   *
   * @param {WebgpuGraphicsDevice} device - Graphics device.
   * @param {BindGroup} bindGroup - Bind group to create the
   * descriptor for.
   * @returns {object} - Returns the generated descriptor of type GPUBindGroupDescriptor, which
   * can be used to create a GPUBindGroup
   */
  createDescriptor(device, bindGroup) {
    const entries = [];
    const format = bindGroup.format;
    Debug.call(() => {
      this.debugFormat = "";
    });
    const uniformBufferFormats = bindGroup.format.uniformBufferFormats;
    bindGroup.uniformBuffers.forEach((ub, i) => {
      const slot = uniformBufferFormats[i].slot;
      const buffer = ub.persistent ? ub.impl.buffer : ub.allocation.gpuBuffer.buffer;
      Debug.assert(buffer, "NULL uniform buffer cannot be used by the bind group");
      Debug.call(() => {
        this.debugFormat += `${slot}: UB
`;
      });
      entries.push({
        binding: slot,
        resource: {
          buffer,
          offset: 0,
          size: ub.format.byteSize
        }
      });
    });
    const textureFormats = bindGroup.format.textureFormats;
    bindGroup.textures.forEach((value, textureIndex) => {
      const isTextureView = value instanceof TextureView;
      const texture = isTextureView ? value.texture : value;
      const wgpuTexture = texture.impl;
      const textureFormat = format.textureFormats[textureIndex];
      const slot = textureFormats[textureIndex].slot;
      const view = wgpuTexture.getView(device, isTextureView ? value : void 0);
      Debug.assert(view, `NULL texture view [${textureFormat.name}] (slot ${slot}) cannot be used by the bind group`);
      Debug.call(() => {
        this.debugFormat += `${slot}: ${bindGroup.format.textureFormats[textureIndex].name}
`;
      });
      entries.push({
        binding: slot,
        resource: view
      });
      if (textureFormat.hasSampler) {
        const sampler = wgpuTexture.getSampler(device, textureFormat.sampleType);
        Debug.assert(sampler, `NULL sampler [${textureFormat.name}] (slot ${slot + 1}) cannot be used by the bind group`);
        Debug.call(() => {
          this.debugFormat += `${slot + 1}: ${sampler.label}
`;
        });
        entries.push({
          binding: slot + 1,
          resource: sampler
        });
      }
    });
    const storageTextureFormats = bindGroup.format.storageTextureFormats;
    bindGroup.storageTextures.forEach((value, textureIndex) => {
      const isTextureView = value instanceof TextureView;
      const texture = isTextureView ? value.texture : value;
      const wgpuTexture = texture.impl;
      const slot = storageTextureFormats[textureIndex].slot;
      const view = wgpuTexture.getView(device, isTextureView ? value : void 0);
      Debug.assert(view, `NULL storage texture view [${storageTextureFormats[textureIndex].name}] (slot ${slot}) cannot be used by the bind group`);
      Debug.call(() => {
        this.debugFormat += `${slot}: ${bindGroup.format.storageTextureFormats[textureIndex].name}
`;
      });
      entries.push({
        binding: slot,
        resource: view
      });
    });
    const storageBufferFormats = bindGroup.format.storageBufferFormats;
    bindGroup.storageBuffers.forEach((buffer, bufferIndex) => {
      const wgpuBuffer = buffer.impl.buffer;
      const slot = storageBufferFormats[bufferIndex].slot;
      Debug.assert(wgpuBuffer, `NULL storage buffer [${storageBufferFormats[bufferIndex].name}] (slot ${slot}, id ${buffer.id}, size ${buffer.byteSize}) cannot be used by the bind group`);
      Debug.call(() => {
        this.debugFormat += `${slot}: SB
`;
      });
      entries.push({
        binding: slot,
        resource: {
          buffer: wgpuBuffer
        }
      });
    });
    const desc = {
      layout: bindGroup.format.impl.bindGroupLayout,
      entries
    };
    DebugHelper.setLabel(desc, bindGroup.name);
    return desc;
  }
}
export {
  WebgpuBindGroup
};
