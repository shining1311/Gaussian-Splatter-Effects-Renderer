/**
 * @import { Scene } from '../scene.js'
 */
/**
 * Implementation of the sky.
 *
 * @category Graphics
 */
export class Sky {
    /**
     * Constructs a new sky.
     *
     * @param {Scene} scene - The scene owning the sky.
     * @ignore
     */
    constructor(scene: Scene);
    /**
     * The type of the sky. One of the SKYTYPE_* constants.
     *
     * @type {string}
     * @private
     */
    private _type;
    /**
     * The center of the sky.
     *
     * @private
     */
    private _center;
    /**
     * The sky mesh of the scene.
     *
     * @type {SkyMesh|null}
     * @ignore
     */
    skyMesh: SkyMesh | null;
    /** @private */
    private _depthWrite;
    /** @private */
    private _fisheye;
    /**
     * Lazily created on first non-zero fisheye set.
     *
     * @type {FisheyeProjection|null}
     * @private
     */
    private _fisheyeProj;
    /**
     * A graph node with a transform used to render the sky mesh. Adjust the position, rotation and
     * scale of this node to orient the sky mesh. Ignored for {@link SKYTYPE_INFINITE}.
     *
     * @type {GraphNode}
     * @readonly
     */
    readonly node: GraphNode;
    device: import("../../index.js").GraphicsDevice;
    scene: Scene;
    /**
     * Sets the center of the sky. Ignored for {@link SKYTYPE_INFINITE}. Typically only the
     * y-coordinate is used, representing the tripod height. Defaults to (0, 1, 0).
     *
     * @type {Vec3}
     */
    set center(value: Vec3);
    /**
     * Gets the center of the sky.
     *
     * @type {Vec3}
     */
    get center(): Vec3;
    centerArray: Float32Array<ArrayBuffer>;
    projectedSkydomeCenterId: import("../../index.js").ScopeId;
    _preRenderEvt: import("../../index.js").EventHandle;
    destroy(): void;
    applySettings(render: any): void;
    /**
     * Sets the type of the sky. Can be:
     *
     * - {@link SKYTYPE_INFINITE}
     * - {@link SKYTYPE_BOX}
     * - {@link SKYTYPE_DOME}
     *
     * Defaults to {@link SKYTYPE_INFINITE}.
     *
     * @type {string}
     */
    set type(value: string);
    /**
     * Gets the type of the sky.
     *
     * @type {string}
     */
    get type(): string;
    /**
     * Sets whether depth writing is enabled for the sky. Defaults to false.
     *
     * Writing a depth value for the skydome is supported when its type is not
     * {@link SKYTYPE_INFINITE}. When enabled, the depth is written during a prepass render pass and
     * can be utilized by subsequent passes to apply depth-based effects, such as Depth of Field.
     *
     * Note: For the skydome to be rendered during the prepass, the Sky Layer must be ordered before
     * the Depth layer, which is the final layer used in the prepass.
     *
     * @type {boolean}
     */
    set depthWrite(value: boolean);
    /**
     * Gets whether depth writing is enabled for the sky.
     *
     * @type {boolean}
     */
    get depthWrite(): boolean;
    /**
     * Sets the fisheye projection strength for the sky. The value is in the range [0, 1]:
     *
     * - 0: Standard rectilinear (perspective) projection.
     * - (0, 1]: Increasing barrel distortion, producing a wider field of view.
     *
     * Only supported with {@link SKYTYPE_INFINITE}. Has no effect on dome or box sky types,
     * and has no effect with orthographic cameras. Defaults to 0.
     *
     * @type {number}
     */
    set fisheye(value: number);
    /**
     * Gets the fisheye projection strength for the sky.
     *
     * @type {number}
     */
    get fisheye(): number;
    updateSkyMesh(): void;
    resetSkyMesh(): void;
    update(): void;
    /**
     * @param {boolean} enabled - Whether to enable the SKY_FISHEYE define.
     * @private
     */
    private _setFisheyeDefine;
    /**
     * Per-camera prerender callback that updates fisheye uniforms for the active camera.
     *
     * @param {import('../../framework/components/camera/component.js').CameraComponent} cameraComponent - The camera about to render.
     * @private
     */
    private _onPreRender;
}
import { SkyMesh } from './sky-mesh.js';
import { GraphNode } from '../graph-node.js';
import type { Scene } from '../scene.js';
import { Vec3 } from '../../core/math/vec3.js';
