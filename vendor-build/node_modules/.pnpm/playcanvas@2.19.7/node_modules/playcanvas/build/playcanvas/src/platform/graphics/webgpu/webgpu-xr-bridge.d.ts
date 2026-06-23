/**
 * WebGPU graphics implementation for {@link XrBridge}.
 *
 * @ignore
 */
export class WebgpuXrBridge {
    /**
     * @param {XrBridge} xrBridge - The XR bridge.
     */
    constructor(xrBridge: XrBridge);
    /**
     * @type {XRGPUBinding|null}
     * @private
     */
    private _binding;
    /**
     * @type {XRProjectionLayer|null}
     * @private
     */
    private _layer;
    /**
     * Last known immersive color buffer size in pixels (updated in {@link WebgpuXrBridge#beginFrame}).
     *
     * @type {Vec2}
     * @private
     */
    private _cachedFramebufferSize;
    /** @type {XrBridge} */
    xrBridge: XrBridge;
    /**
     * @param {GraphicsDevice} device - The graphics device.
     */
    destroy(device: GraphicsDevice): void;
    /**
     * @param {XRFrame} frame - Current XR frame.
     * @param {XRReferenceSpace|null} referenceSpace - Active reference space for the XR session.
     */
    beginFrame(frame: XRFrame, referenceSpace: XRReferenceSpace | null): void;
    endFrame(): void;
    /**
     * @returns {any} // `XRProjectionLayer | null`; using `any` to avoid exporting WebXR GPU types in published typings.
     */
    get presentationLayer(): any;
    /**
     * @returns {any} // `XRGPUBinding | null`; using `any` to avoid exporting WebXR GPU types in published typings.
     */
    get graphicsBinding(): any;
    /**
     * @param {XRFrame} _frame - Current XR frame.
     * @param {Vec2} out - Width in {@link Vec2#x}, height in {@link Vec2#y}.
     */
    getFramebufferSize(_frame: XRFrame, out: Vec2): void;
    /**
     * @param {XRFrame} _frame - Current XR frame.
     * @param {XRView} xrView - WebXR view.
     * @returns {XRViewport} Viewport for this view, or zeros if unavailable.
     */
    getViewport(_frame: XRFrame, xrView: XRView): XRViewport;
    /**
     * @param {XRSession} session - XR session.
     * @param {object} options - Presentation options.
     * @param {number} options.framebufferScaleFactor - Resolved framebuffer scale factor.
     * @param {number} options.depthNear - Depth near plane.
     * @param {number} options.depthFar - Depth far plane.
     * @param {Function} [options.onBindingError] - Called if XRGPUBinding construction fails.
     */
    attachPresentation(session: XRSession, options: {
        framebufferScaleFactor: number;
        depthNear: number;
        depthFar: number;
        onBindingError?: Function;
    }): void;
    /**
     * Copies the XR passthrough camera image for the given XRCamera into a PlayCanvas
     * {@link Texture} using `copyTextureToTexture`. No-ops if `XRGPUBinding.getCameraImage` is
     * unavailable or returns nothing this frame.
     *
     * @param {any} xrCamera - The XR camera whose image should be copied (XRCamera from WebXR API).
     * @param {Texture} texture - Destination engine texture.
     */
    syncCameraColorTexture(xrCamera: any, texture: Texture): void;
    /**
     * GPU XR depth texture binding is not implemented for WebGPU yet (`XRGPUBinding` has no depth API).
     *
     * @param {any} depthInfo - Depth information from WebXR (`getDepthInformation`); when `texture` is set, GPU depth was negotiated.
     * @param {Texture} _texture - Unused until WebGPU depth is implemented.
     * @param {number} _depthPixelFormat - Unused until WebGPU depth is implemented.
     */
    syncCameraDepthTexture(depthInfo: any, _texture: Texture, _depthPixelFormat: number): void;
    /**
     * Clears the WebXR WebGPU binding reference (projection layer remains until session end).
     */
    releasePresentation(): void;
    /**
     * Clears WebXR WebGPU binding and projection layer references and removes immersive layers from
     * the session (mirrors {@link WebglXrBridge#onGraphicsDeviceLost} clearing the base layer).
     */
    onGraphicsDeviceLost(): void;
    /**
     * Recreates WebXR WebGPU presentation after GPU restore; fires `"error"` on the bridge
     * {@link XrBridge#eventHandler} if re-attachment fails.
     */
    onGraphicsDeviceRestored(): void;
}
import type { XrBridge } from '../xr-bridge.js';
import type { GraphicsDevice } from '../graphics-device.js';
import { Vec2 } from '../../../core/math/vec2.js';
import type { Texture } from '../texture.js';
