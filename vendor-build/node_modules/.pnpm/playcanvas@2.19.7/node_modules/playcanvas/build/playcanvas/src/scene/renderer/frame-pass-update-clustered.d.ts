/**
 * A render pass used to update clustered lighting data - shadows, cookies, world clusters.
 *
 * @ignore
 */
export class FramePassUpdateClustered extends FramePass {
    constructor(device: any, renderer: any, shadowRenderer: any, shadowRendererLocal: any, lightTextureAtlas: any);
    renderer: any;
    frameGraph: any;
    cookiesRenderPass: RenderPassCookieRenderer;
    shadowRenderPass: RenderPassShadowLocalClustered;
    update(frameGraph: any, shadowsEnabled: any, cookiesEnabled: any, lights: any, localLights: any): void;
}
import { FramePass } from '../../platform/graphics/frame-pass.js';
import { RenderPassCookieRenderer } from './render-pass-cookie-renderer.js';
import { RenderPassShadowLocalClustered } from './render-pass-shadow-local-clustered.js';
