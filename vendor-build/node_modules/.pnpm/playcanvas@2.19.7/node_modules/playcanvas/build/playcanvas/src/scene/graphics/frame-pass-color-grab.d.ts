/**
 * A render pass implementing grab of a color buffer.
 *
 * @ignore
 */
export class FramePassColorGrab extends FramePass {
    colorRenderTarget: any;
    /**
     * The source render target to grab the color from.
     *
     * @type {RenderTarget|null}
     */
    source: RenderTarget | null;
    shouldReallocate(targetRT: any, sourceTexture: any, sourceFormat: any): boolean;
    allocateRenderTarget(renderTarget: any, sourceRenderTarget: any, device: any, format: any): any;
    releaseRenderTarget(rt: any): void;
}
import { FramePass } from '../../platform/graphics/frame-pass.js';
import { RenderTarget } from '../../platform/graphics/render-target.js';
