/**
 * WebGL graphics implementation for {@link XrBridge}.
 *
 * @ignore
 */
export class WebglXrBridge {
    /**
     * @param {XrBridge} xrBridge - The XR bridge.
     */
    constructor(xrBridge: XrBridge);
    /**
     * @type {XRWebGLLayer|null}
     * @private
     */
    private _presentationLayer;
    /**
     * @type {XRWebGLBinding|null}
     * @private
     */
    private _graphicsBinding;
    /**
     * Read framebuffer used to blit the XR camera image into the engine texture.
     *
     * @type {WebGLFramebuffer|null}
     * @private
     */
    private _cameraFbSource;
    /**
     * Draw framebuffer used to blit the XR camera image into the engine texture.
     *
     * @type {WebGLFramebuffer|null}
     * @private
     */
    private _cameraFbDest;
    /** @type {XrBridge} */
    xrBridge: XrBridge;
    /**
     * @param {GraphicsDevice} device - The graphics device.
     */
    destroy(device: GraphicsDevice): void;
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @private
     */
    private _deleteCameraFramebuffers;
    /**
     * Sets the WebGL default framebuffer to the XR session's base layer framebuffer.
     * When there is no base layer (for example after GPU device loss), falls back to the
     * canvas framebuffer by assigning null.
     *
     * @param {XRFrame} frame - Current XR frame.
     * @param {XRReferenceSpace|null} _referenceSpace - Active XR reference space.
     */
    beginFrame(frame: XRFrame, _referenceSpace: XRReferenceSpace | null): void;
    /**
     * Resets the WebGL default framebuffer to the canvas (null).
     */
    endFrame(): void;
    /**
     * @returns {XRWebGLLayer|null} The active XR output layer, if any.
     */
    get presentationLayer(): XRWebGLLayer | null;
    /**
     * @returns {XRWebGLBinding|null} The WebXR GL binding for GPU camera/depth paths, if any.
     */
    get graphicsBinding(): XRWebGLBinding | null;
    /**
     * @param {XRFrame} frame - Current XR frame.
     * @param {Vec2} out - Width in {@link Vec2#x}, height in {@link Vec2#y}.
     */
    getFramebufferSize(frame: XRFrame, out: Vec2): void;
    /**
     * @param {XRFrame} frame - Current XR frame.
     * @param {XRView} xrView - WebXR view.
     * @returns {XRViewport} Viewport from the session base layer, or zeros if the base layer is unavailable.
     */
    getViewport(frame: XRFrame, xrView: XRView): XRViewport;
    /**
     * @param {XRSession} session - XR session.
     * @param {object} options - Presentation options.
     * @param {number} options.framebufferScaleFactor - Resolved framebuffer scale factor.
     * @param {number} options.depthNear - Depth near plane.
     * @param {number} options.depthFar - Depth far plane.
     * @param {Function} [options.onBindingError] - Called if XRWebGLBinding construction fails.
     */
    attachPresentation(session: XRSession, options: {
        framebufferScaleFactor: number;
        depthNear: number;
        depthFar: number;
        onBindingError?: Function;
    }): void;
    /**
     * Matches {@link XrManager#end} clearing {@link XrManager#graphicsBinding} only.
     */
    releasePresentation(): void;
    /**
     * Copies the XR passthrough camera image for the given XRCamera into a PlayCanvas
     * {@link Texture}, with a Y-flip to match engine UV conventions. No-ops if the graphics
     * binding is unavailable or the camera image is not ready this frame.
     *
     * @param {any} xrCamera - The XR camera whose image should be copied (XRCamera from WebXR API).
     * @param {Texture} texture - Destination engine texture (must be GPU-uploaded).
     */
    syncCameraColorTexture(xrCamera: any, texture: Texture): void;
    /**
     * Aliases the XR runtime depth GL texture into the engine {@link Texture} implementation.
     *
     * @param {any} depthInfo - Depth information from WebXR (`getDepthInformation`).
     * @param {Texture} texture - Destination engine texture.
     * @param {number} depthPixelFormat - Resolved depth pixel format (`PIXELFORMAT_R32F` or `PIXELFORMAT_DEPTH`).
     */
    syncCameraDepthTexture(depthInfo: any, texture: Texture, depthPixelFormat: number): void;
    onGraphicsDeviceLost(): void;
    /**
     * Recreates presentation after GPU restore; fires `"error"` on the bridge {@link XrBridge#eventHandler} if restore fails.
     */
    onGraphicsDeviceRestored(): void;
}
import type { XrBridge } from '../xr-bridge.js';
import type { GraphicsDevice } from '../graphics-device.js';
import type { Vec2 } from '../../../core/math/vec2.js';
import type { Texture } from '../texture.js';
