/**
 * @import { GraphicsDevice } from '../graphics/graphics-device.js'
 */
/**
 * A frame pass represents a node in the frame graph. It encapsulates a unit of work that
 * executes during frame rendering. Subclasses include {@link RenderPass} for GPU render passes
 * with render targets, and non-rendering passes for compute dispatches or other tasks.
 *
 * @ignore
 */
export class FramePass {
    /**
     * Creates an instance of the FramePass.
     *
     * @param {GraphicsDevice} graphicsDevice - The graphics device.
     */
    constructor(graphicsDevice: GraphicsDevice);
    /** @type {string} */
    _name: string;
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * True if the frame pass is enabled.
     *
     * @private
     */
    private _enabled;
    /**
     * True if the render pass start is skipped. This means the render pass is merged into the
     * previous one. Used by FrameGraph.compile() for pass merging.
     *
     * @private
     */
    private _skipStart;
    /**
     * True if the render pass end is skipped. This means the following render pass is merged into
     * this one. Used by FrameGraph.compile() for pass merging.
     *
     * @private
     */
    private _skipEnd;
    /**
     * True if the frame pass is enabled and execute function will be called. Note that before and
     * after functions are called regardless of this flag.
     */
    executeEnabled: boolean;
    /**
     * If true, this pass might use dynamically rendered cubemaps. Defaults to false for non-render
     * passes (RenderPass overrides to true).
     */
    requiresCubemaps: boolean;
    /**
     * Frame passes which need to be executed before this pass.
     *
     * @type {FramePass[]}
     */
    beforePasses: FramePass[];
    /**
     * Frame passes which need to be executed after this pass.
     *
     * @type {FramePass[]}
     */
    afterPasses: FramePass[];
    set name(value: string);
    get name(): string;
    set enabled(value: boolean);
    get enabled(): boolean;
    onEnable(): void;
    onDisable(): void;
    frameUpdate(): void;
    before(): void;
    execute(): void;
    after(): void;
    destroy(): void;
    render(): void;
    log(device: any, index?: number): void;
}
import type { GraphicsDevice } from '../graphics/graphics-device.js';
