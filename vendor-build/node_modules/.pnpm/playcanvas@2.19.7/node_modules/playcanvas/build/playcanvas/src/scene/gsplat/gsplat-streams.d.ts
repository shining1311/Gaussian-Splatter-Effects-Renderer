/**
 * @import { GraphicsDevice } from '../../platform/graphics/graphics-device.js'
 * @import { GSplatFormat } from './gsplat-format.js'
 */
/**
 * Manages textures for a GSplatFormat, creating them from stream definitions.
 *
 * @ignore
 */
export class GSplatStreams {
    /**
     * Creates a new GSplatStreams instance.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {boolean} [isInstance] - Whether this manages instance-level textures (true) or
     * resource-level textures (false). Defaults to false.
     */
    constructor(device: GraphicsDevice, isInstance?: boolean);
    /**
     * The graphics device.
     *
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * The format defining the streams.
     *
     * @type {GSplatFormat|null}
     */
    format: GSplatFormat | null;
    /**
     * Map of texture names to Texture instances.
     *
     * @type {Map<string, Texture>}
     */
    textures: Map<string, Texture>;
    /**
     * Texture dimensions (width and height).
     *
     * @private
     */
    private _textureDimensions;
    /**
     * Whether this manages instance-level textures (true) or resource-level textures (false).
     *
     * @private
     */
    private _isInstance;
    /**
     * The format version at last sync.
     *
     * @private
     */
    private _formatVersion;
    /**
     * Gets the texture dimensions (width and height).
     *
     * @type {Vec2}
     */
    get textureDimensions(): Vec2;
    /**
     * Destroys all managed textures.
     */
    destroy(): void;
    /**
     * Initialize with format and create textures for all streams.
     *
     * @param {GSplatFormat} format - The format defining streams.
     * @param {number} numElements - Number of elements (splats) to size textures for.
     */
    init(format: GSplatFormat, numElements: number): void;
    /**
     * Gets a texture by name.
     *
     * @param {string} name - Texture name.
     * @returns {Texture|undefined} The texture, or undefined if not found.
     */
    getTexture(name: string): Texture | undefined;
    /**
     * Gets all textures in format order (streams followed by extraStreams).
     *
     * @returns {Texture[]} Array of textures in format order.
     * @ignore
     */
    getTexturesInOrder(): Texture[];
    /**
     * Synchronizes textures with the format's stream definitions.
     * Creates new textures for added streams. Textures are never destroyed here -
     * streams can only be added, not removed (see GSplatFormat._extraStreams for rationale).
     *
     * @param {GSplatFormat|null} format - The format to sync with, or null to skip.
     * @ignore
     */
    syncWithFormat(format: GSplatFormat | null): void;
    /**
     * Resizes all managed textures to the specified dimensions. This assumes all textures
     * have uniform dimensions (e.g. work buffer textures). Do not use on resources with
     * mixed-size textures (e.g. SOG with differently-sized SH textures).
     *
     * @param {number} width - The new width.
     * @param {number} height - The new height.
     */
    resize(width: number, height: number): void;
    /**
     * Creates a new texture with the specified parameters.
     *
     * @param {string} name - The name of the texture to be created.
     * @param {number} format - The pixel format of the texture.
     * @param {Vec2} size - The size of the texture in a Vec2 object, containing width (x) and height (y).
     * @param {Uint8Array|Uint16Array|Uint32Array|Float32Array} [data] - The initial data to fill the texture with.
     * @returns {Texture} The created texture instance.
     */
    createTexture(name: string, format: number, size: Vec2, data?: Uint8Array | Uint16Array | Uint32Array | Float32Array): Texture;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { GSplatFormat } from './gsplat-format.js';
import { Texture } from '../../platform/graphics/texture.js';
import { Vec2 } from '../../core/math/vec2.js';
