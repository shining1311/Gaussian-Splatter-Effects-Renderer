/**
 * @import { EventHandle } from '../../../core/event-handle.js'
 * @import { SpriteComponent } from './component.js'
 * @import { Sprite } from '../../../scene/sprite.js'
 */
/**
 * Handles playing of sprite animations and loading of relevant sprite assets.
 *
 * @category Graphics
 */
export class SpriteAnimationClip extends EventHandler {
    /**
     * Fired when the clip starts playing.
     *
     * @event
     * @example
     * clip.on('play', () => {
     *     console.log('Clip started playing');
     * });
     */
    static EVENT_PLAY: string;
    /**
     * Fired when the clip is paused.
     *
     * @event
     * @example
     * clip.on('pause', () => {
     *     console.log('Clip paused');
     * });
     */
    static EVENT_PAUSE: string;
    /**
     * Fired when the clip is resumed.
     *
     * @event
     * @example
     * clip.on('resume', () => {
     *     console.log('Clip resumed');
     * });
     */
    static EVENT_RESUME: string;
    /**
     * Fired when the clip is stopped.
     *
     * @event
     * @example
     * clip.on('stop', () => {
     *     console.log('Clip stopped');
     * });
     */
    static EVENT_STOP: string;
    /**
     * Fired when the clip stops playing because it reached its end.
     *
     * @event
     * @example
     * clip.on('end', () => {
     *     console.log('Clip ended');
     * });
     */
    static EVENT_END: string;
    /**
     * Fired when the clip reached the end of its current loop.
     *
     * @event
     * @example
     * clip.on('loop', () => {
     *     console.log('Clip looped');
     * });
     */
    static EVENT_LOOP: string;
    /**
     * Create a new SpriteAnimationClip instance.
     *
     * @param {SpriteComponent} component - The sprite component managing this clip.
     * @param {object} data - Data for the new animation clip.
     * @param {number} [data.fps] - Frames per second for the animation clip.
     * @param {boolean} [data.loop] - Whether to loop the animation clip.
     * @param {string} [data.name] - The name of the new animation clip.
     * @param {number} [data.spriteAsset] - The id of the sprite asset that this clip will play.
     */
    constructor(component: SpriteComponent, data: {
        fps?: number;
        loop?: boolean;
        name?: string;
        spriteAsset?: number;
    });
    /**
     * @type {EventHandle|null}
     * @private
     */
    private _evtSetMeshes;
    /**
     * @type {SpriteComponent}
     * @private
     */
    private _component;
    /** @private */
    private _frame;
    /**
     * @type {Sprite|null}
     * @private
     */
    private _sprite;
    /**
     * @type {number|null}
     * @private
     */
    private _spriteAsset;
    /** @private */
    private _playing;
    /** @private */
    private _paused;
    /** @private */
    private _time;
    /**
     * The name of this animation clip.
     *
     * @type {string|undefined}
     */
    name: string | undefined;
    /**
     * Frames per second for this animation clip. A negative value plays the animation backwards.
     *
     * @type {number}
     */
    fps: number;
    /**
     * Whether to loop the animation clip when it reaches the end.
     *
     * @type {boolean}
     */
    loop: boolean;
    /**
     * Sets the id of the sprite asset used to play the animation.
     *
     * @type {number}
     */
    set spriteAsset(value: number);
    /**
     * Gets the id of the sprite asset used to play the animation.
     *
     * @type {number}
     */
    get spriteAsset(): number;
    /**
     * Gets the total duration of the animation in seconds.
     *
     * @type {number}
     */
    get duration(): number;
    /**
     * Sets the index of the frame of the {@link Sprite} currently being rendered.
     *
     * @type {number}
     */
    set frame(value: number);
    /**
     * Gets the index of the frame of the {@link Sprite} currently being rendered.
     *
     * @type {number}
     */
    get frame(): number;
    /**
     * Sets whether the animation is currently paused.
     *
     * @type {boolean}
     */
    get isPaused(): boolean;
    /**
     * Sets whether the animation is currently playing.
     *
     * @type {boolean}
     */
    get isPlaying(): boolean;
    /**
     * Sets the current sprite used to play the animation.
     *
     * @type {Sprite}
     */
    set sprite(value: Sprite);
    /**
     * Gets the current sprite used to play the animation.
     *
     * @type {Sprite}
     */
    get sprite(): Sprite;
    /**
     * Sets the current time of the animation in seconds.
     *
     * @type {number}
     */
    set time(value: number);
    /**
     * Gets the current time of the animation in seconds.
     *
     * @type {number}
     */
    get time(): number;
    _onSpriteAssetAdded(asset: any): void;
    _bindSpriteAsset(asset: any): void;
    _unbindSpriteAsset(asset: any): void;
    _onSpriteAssetLoad(asset: any): void;
    _onTextureAtlasLoad(atlasAsset: any): void;
    _onSpriteAssetRemove(asset: any): void;
    _onSpriteMeshesChange(): void;
    _onSpritePpuChanged(): void;
    /**
     * Advances the animation, looping if necessary.
     *
     * @param {number} dt - The delta time.
     * @private
     */
    private _update;
    _setTime(value: any): void;
    _setFrame(value: any): void;
    _destroy(): void;
    /**
     * Plays the animation. If it's already playing then this does nothing.
     */
    play(): void;
    /**
     * Pauses the animation.
     */
    pause(): void;
    /**
     * Resumes the paused animation.
     */
    resume(): void;
    /**
     * Stops the animation and resets the animation to the first frame.
     */
    stop(): void;
}
import { EventHandler } from '../../../core/event-handler.js';
import type { Sprite } from '../../../scene/sprite.js';
import type { SpriteComponent } from './component.js';
