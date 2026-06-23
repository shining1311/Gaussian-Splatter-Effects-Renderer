/**
 * Helper that resolves the MSAA color buffer into the WebXR session framebuffer on platforms where
 * direct `blitFramebuffer` into the XR opaque FBO does not work correctly (e.g. visionOS).
 *
 * The operation is two-stage:
 *  1. Resolve step: MSAA renderbuffer → engine-owned scratch `Texture` via `blitFramebuffer` (this
 *      blit is into an ordinary app-owned texture, which works on all platforms).
 *  2. A single fullscreen quad draw into the XR FBO
 *
 * The instance lives on {@link WebglGraphicsDevice} and is created lazily the first time the copy
 * is needed.
 *
 * @ignore
 */
export class WebglXrMsaaCopy {
    /**
     * @param {WebglGraphicsDevice} device - The WebGL graphics device.
     */
    constructor(device: WebglGraphicsDevice);
    /**
     * @type {WebglGraphicsDevice}
     * @private
     */
    private _device;
    /**
     * @type {Shader|null}
     * @private
     */
    private _shader;
    /**
     * @type {Texture|null}
     * @private
     */
    private _scratchTex;
    /**
     * @type {RenderTarget|null}
     * @private
     */
    private _scratchRt;
    /**
     * @type {import('../../../platform/graphics/scope-id.js').ScopeId|null}
     * @private
     */
    private _sourceId;
    /**
     * Returns the copy shader, creating it on first call.
     *
     * @returns {Shader} The shader.
     * @private
     */
    private _getShader;
    /**
     * Ensure the scratch single-sample texture and its render target exist and match the given
     * dimensions. Reallocates if the size has changed (rare: only when XR layer resolution
     * changes).
     *
     * @param {number} width - Full SBS framebuffer width in pixels.
     * @param {number} height - Framebuffer height in pixels.
     * @private
     */
    private _ensureScratch;
    /**
     * Resolve MSAA color into the XR session framebuffer via a scratch texture and a fullscreen quad.
     *
     * @param {WebGLFramebuffer} msaaReadFbo - Multisampled source framebuffer.
     * @param {WebGLFramebuffer} xrDrawFbo - XR base layer framebuffer.
     * @param {number} width - Full SBS framebuffer width in pixels.
     * @param {number} height - Framebuffer height in pixels.
     */
    copy(msaaReadFbo: WebGLFramebuffer, xrDrawFbo: WebGLFramebuffer, width: number, height: number): void;
    /**
     * Destroy all GPU resources owned by this instance.
     */
    destroy(): void;
}
import type { WebglGraphicsDevice } from './webgl-graphics-device.js';
