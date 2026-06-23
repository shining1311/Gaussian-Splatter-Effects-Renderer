import { TRACEID_PIPELINELAYOUT_ALLOC } from "../../../core/constants.js";
import { Debug, DebugHelper } from "../../../core/debug.js";
let _layoutId = 0;
class WebgpuPipeline {
  constructor(device) {
    this.device = device;
  }
  // TODO: this could be cached using bindGroupKey
  /**
   * @param {BindGroupFormat[]} bindGroupFormats - An array of bind group formats.
   * @returns {any} Returns the pipeline layout.
   */
  getPipelineLayout(bindGroupFormats) {
    const bindGroupLayouts = [];
    bindGroupFormats.forEach((format) => {
      bindGroupLayouts.push(format.bindGroupLayout);
    });
    const desc = {
      bindGroupLayouts
    };
    _layoutId++;
    DebugHelper.setLabel(desc, `PipelineLayoutDescr-${_layoutId}`);
    const pipelineLayout = this.device.wgpu.createPipelineLayout(desc);
    DebugHelper.setLabel(pipelineLayout, `PipelineLayout-${_layoutId}`);
    Debug.trace(TRACEID_PIPELINELAYOUT_ALLOC, `Alloc: Id ${_layoutId}`, {
      desc,
      bindGroupFormats
    });
    return pipelineLayout;
  }
}
export {
  WebgpuPipeline
};
