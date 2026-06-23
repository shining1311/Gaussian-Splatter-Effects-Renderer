/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 */
/**
 * A frame pass that wraps an ordered list of child frame passes and runs them once per XR view.
 * Currently used by the WebGPU XR path: per eye, the wrapper sets the active view index on the
 * graphics device, swaps the backbuffer color view to the matching XR sub-image view descriptor,
 * and invokes each child's `render()`.
 *
 * The children are not added to {@link FrameGraph#renderPasses} - they are owned by the wrapper
 * and invoked from {@link FramePassMultiView#render}. This guarantees the frame graph's
 * pass-merging cannot accidentally merge eye-N's last pass with eye-(N+1)'s first pass.
 *
 * ## Future extension paths
 *
 * ### GPU-native multiview (single-pass stereo)
 * Both WebGL (`OVR_multiview2`) and a future WebGPU multiview extension allow the GPU to render
 * all views in **one draw call**, writing to each array layer simultaneously via
 * `gl_ViewID_OVR` (WebGL) or `@builtin(view_index)` (WGSL). When those APIs become available
 * this class is the right place to switch strategy: instead of looping N times, `render()` would
 * configure a single multiview render pass targeting an array render target, upload all N view
 * matrices as an array UBO, and issue children once. The serial-iteration path would remain as a
 * fallback when the extension is absent.
 *
 * ### WebGL stereo
 * WebGL XR currently uses a single framebuffer with per-eye viewports (no wrapper needed).
 * If `OVR_multiview2` support is added, `ForwardRenderer._isMultiview` could be extended to
 * return `true` for WebGL when the extension is present, allowing this wrapper to orchestrate
 * the multiview setup on both backends with a shared code path.
 *
 * @ignore
 */
export class FramePassMultiView extends FramePass {
    /**
     * Ordered list of child passes executed once per XR view.
     *
     * @type {FramePass[]}
     */
    children: FramePass[];
    /**
     * Append a child pass to be replayed per view.
     *
     * @param {FramePass} pass - The pass to add.
     */
    addChild(pass: FramePass): void;
}
import { FramePass } from '../../platform/graphics/frame-pass.js';
