/**
 * @import { FramePass } from '../platform/graphics/frame-pass.js'
 * @import { GraphicsDevice } from '../platform/graphics/graphics-device.js'
 * @import { RenderPass } from '../platform/graphics/render-pass.js'
 * @import { RenderTarget } from '../platform/graphics/render-target.js'
 * @import { Texture } from '../platform/graphics/texture.js'
 */
/**
 * A frame graph represents a single rendering frame as a sequence of frame passes.
 *
 * @ignore
 */
export class FrameGraph {
    /** @type {FramePass[]} */
    renderPasses: FramePass[];
    /**
     * Map used during frame graph compilation. It maps a render target to its previous occurrence.
     *
     * @type {Map<RenderTarget, RenderPass>}
     */
    renderTargetMap: Map<RenderTarget, RenderPass>;
    /**
     * Active multi-view capture wrapper. When non-null, passes scheduled via
     * {@link FrameGraph#addRenderPass} are appended as children of this wrapper instead of being
     * pushed directly into {@link FrameGraph#renderPasses}. Set/cleared via
     * {@link FrameGraph#beginMultiView} / {@link FrameGraph#endMultiView}.
     *
     * @type {FramePassMultiView|null}
     */
    multiview: FramePassMultiView | null;
    /**
     * Open a multi-view capture scope. Subsequent passes added through
     * {@link FrameGraph#addRenderPass} are captured as children of a single
     * {@link FramePassMultiView} until {@link FrameGraph#endMultiView} is called.
     *
     * @param {GraphicsDevice} device - The graphics device used to construct the wrapper.
     */
    beginMultiView(device: GraphicsDevice): void;
    /**
     * Close the multi-view capture scope. Pushes the wrapper into the frame graph render passes
     * unless it captured no children (in which case it is dropped).
     */
    endMultiView(): void;
    /**
     * Add a frame pass to the frame.
     *
     * @param {FramePass} renderPass - The frame pass to add.
     */
    addRenderPass(renderPass: FramePass): void;
    reset(): void;
    compile(): void;
    /**
     * Run the frame-graph compile optimisations (store-on-no-clear, pass merging, cube mipmap
     * skipping) over a flat list of passes.
     *
     * @param {FramePass[]} passes - Passes to optimise.
     * @private
     */
    private _compilePasses;
    render(device: any): void;
}
import type { FramePass } from '../platform/graphics/frame-pass.js';
import type { RenderTarget } from '../platform/graphics/render-target.js';
import type { RenderPass } from '../platform/graphics/render-pass.js';
import { FramePassMultiView } from './renderer/frame-pass-multi-view.js';
import type { GraphicsDevice } from '../platform/graphics/graphics-device.js';
