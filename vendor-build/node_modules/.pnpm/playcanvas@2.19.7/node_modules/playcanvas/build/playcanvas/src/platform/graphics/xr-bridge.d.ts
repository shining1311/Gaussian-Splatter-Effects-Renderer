/**
 * @import { GraphicsDevice } from './graphics-device.js'
 * @import { EventHandler } from '../../core/event-handler.js'
 * @import { EventHandle } from '../../core/event-handle.js'
 * @import { Texture } from './texture.js'
 * @import { Vec2 } from '../../core/math/vec2.js'
 */
/**
 * Bridges WebXR presentation to the graphics device backend.
 *
 * @ignore
 */
export class XrBridge {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {EventHandler} eventHandler - Target for firing XR-related errors.
     */
    constructor(device: GraphicsDevice, eventHandler: EventHandler);
    /**
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * Receives XR presentation-related events (for example {@link EventHandler#fire} with name `"error"`).
     *
     * @type {EventHandler}
     */
    eventHandler: EventHandler;
    /**
     * @type {object}
     */
    impl: object;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtDeviceLost;
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtDeviceRestored;
    /**
     * Active XR session for presentation (shared across graphics backends).
     *
     * @type {XRSession|null}
     * @private
     */
    private _session;
    /**
     * Resolved framebuffer scale from the last {@link XrBridge#attachPresentation}.
     *
     * @type {number}
     * @private
     */
    private _framebufferScaleFactor;
    /**
     * Callback when backend GPU binding construction fails.
     *
     * @type {Function|undefined}
     * @private
     */
    private _onBindingError;
    destroy(): void;
    /** @private */
    private _onDeviceLost;
    /** @private */
    private _onDeviceRestored;
    /**
     * @param {XRSession} session - XR session.
     * @param {object} options - Presentation options (backend-specific; includes framebufferScaleFactor, depthNear, depthFar).
     */
    attachPresentation(session: XRSession, options: object): void;
    releasePresentation(): void;
    /**
     * Called once per XR frame before rendering to set the backend render target for this frame.
     *
     * @param {XRFrame} frame - Current XR frame.
     * @param {XRReferenceSpace|null} referenceSpace - Active XR reference space (WebGPU path uses
     * it for subimages).
     */
    beginFrame(frame: XRFrame, referenceSpace: XRReferenceSpace | null): void;
    /**
     * Resets the backend render target after the XR session ends.
     */
    endFrame(): void;
    /**
     * Writes immersive framebuffer size in pixels for this frame (backend-specific source)
     * into {@link Vec2#x} (width) and {@link Vec2#y} (height).
     *
     * @param {XRFrame} frame - Current XR frame.
     * @param {Vec2} out - Receives width and height; reused by the caller to avoid per-frame allocation.
     */
    getFramebufferSize(frame: XRFrame, out: Vec2): void;
    /**
     * Viewport rectangle for an XR view within the immersive framebuffer (or per-view texture).
     *
     * @param {XRFrame} frame - Current XR frame.
     * @param {XRView} xrView - WebXR view.
     * @returns {XRViewport} Viewport for this view.
     */
    getViewport(frame: XRFrame, xrView: XRView): XRViewport;
    /**
     * Copies the XR passthrough camera image for the given `XRCamera` into a PlayCanvas
     * {@link Texture}. Delegates to the backend implementation; no-ops if not supported.
     *
     * @param {any} xrCamera - The XR camera whose image should be copied (XRCamera from WebXR API).
     * @param {Texture} texture - Destination engine texture.
     */
    syncCameraColorTexture(xrCamera: any, texture: Texture): void;
    /**
     * Binds XR GPU depth information to the engine depth texture on backends that support it
     * (WebGL). No-ops on WebGPU until a binding API exists.
     *
     * @param {any} depthInfo - Depth information from WebXR (`getDepthInformation`).
     * @param {Texture} texture - Destination engine texture.
     * @param {number} depthPixelFormat - Resolved depth pixel format constant (`PIXELFORMAT_*`).
     */
    syncCameraDepthTexture(depthInfo: any, texture: Texture, depthPixelFormat: number): void;
    /**
     * @returns {XRLayer|null} Backend output layer (e.g. XRWebGLLayer), if any.
     */
    get presentationLayer(): XRLayer | null;
    /**
     * Backend graphics binding for camera/depth when available (for example WebGL
     * {@link XRWebGLBinding} or WebGPU `XRGPUBinding` when exposed by the user agent).
     *
     * @returns {Object|null} The binding object, or null.
     */
    get graphicsBinding(): any | null;
}
import type { GraphicsDevice } from './graphics-device.js';
import type { EventHandler } from '../../core/event-handler.js';
import type { Vec2 } from '../../core/math/vec2.js';
import type { Texture } from './texture.js';
