var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { EventHandler } from "../../../core/event-handler.js";
import { math } from "../../../core/math/math.js";
import { Asset } from "../../asset/asset.js";
import { SPRITE_RENDERMODE_SIMPLE } from "../../../scene/constants.js";
class SpriteAnimationClip extends EventHandler {
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
  constructor(component, data) {
    super();
    /**
     * @type {EventHandle|null}
     * @private
     */
    __publicField(this, "_evtSetMeshes", null);
    /**
     * @type {SpriteComponent}
     * @private
     */
    __publicField(this, "_component");
    /** @private */
    __publicField(this, "_frame", 0);
    /**
     * @type {Sprite|null}
     * @private
     */
    __publicField(this, "_sprite", null);
    /**
     * @type {number|null}
     * @private
     */
    __publicField(this, "_spriteAsset", null);
    /** @private */
    __publicField(this, "_playing", false);
    /** @private */
    __publicField(this, "_paused", false);
    /** @private */
    __publicField(this, "_time", 0);
    /**
     * The name of this animation clip.
     *
     * @type {string|undefined}
     */
    __publicField(this, "name");
    /**
     * Frames per second for this animation clip. A negative value plays the animation backwards.
     *
     * @type {number}
     */
    __publicField(this, "fps", 0);
    /**
     * Whether to loop the animation clip when it reaches the end.
     *
     * @type {boolean}
     */
    __publicField(this, "loop", false);
    this._component = component;
    this.fps = data.fps || 0;
    this.loop = data.loop || false;
    this.name = data.name;
    this.spriteAsset = data.spriteAsset;
  }
  /**
   * Gets the total duration of the animation in seconds.
   *
   * @type {number}
   */
  get duration() {
    if (this._sprite) {
      const fps = this.fps || Number.MIN_VALUE;
      return this._sprite.frameKeys.length / Math.abs(fps);
    }
    return 0;
  }
  /**
   * Sets the index of the frame of the {@link Sprite} currently being rendered.
   *
   * @type {number}
   */
  set frame(value) {
    this._setFrame(value);
    const fps = this.fps || Number.MIN_VALUE;
    this._setTime(this._frame / fps);
  }
  /**
   * Gets the index of the frame of the {@link Sprite} currently being rendered.
   *
   * @type {number}
   */
  get frame() {
    return this._frame;
  }
  /**
   * Sets whether the animation is currently paused.
   *
   * @type {boolean}
   */
  get isPaused() {
    return this._paused;
  }
  /**
   * Sets whether the animation is currently playing.
   *
   * @type {boolean}
   */
  get isPlaying() {
    return this._playing;
  }
  /**
   * Sets the current sprite used to play the animation.
   *
   * @type {Sprite}
   */
  set sprite(value) {
    if (this._sprite) {
      this._evtSetMeshes?.off();
      this._evtSetMeshes = null;
      this._sprite.off("set:pixelsPerUnit", this._onSpritePpuChanged, this);
      this._sprite.off("set:atlas", this._onSpriteMeshesChange, this);
      if (this._sprite.atlas) {
        this._sprite.atlas.off("set:texture", this._onSpriteMeshesChange, this);
      }
    }
    this._sprite = value;
    if (this._sprite) {
      this._evtSetMeshes = this._sprite.on("set:meshes", this._onSpriteMeshesChange, this);
      this._sprite.on("set:pixelsPerUnit", this._onSpritePpuChanged, this);
      this._sprite.on("set:atlas", this._onSpriteMeshesChange, this);
      if (this._sprite.atlas) {
        this._sprite.atlas.on("set:texture", this._onSpriteMeshesChange, this);
      }
    }
    if (this._component.currentClip === this) {
      let mi;
      if (!value || !value.atlas) {
        mi = this._component._meshInstance;
        if (mi) {
          mi.deleteParameter("texture_emissiveMap");
          mi.deleteParameter("texture_opacityMap");
        }
        this._component.removeFromLayers();
      } else {
        if (value.atlas.texture) {
          mi = this._component._meshInstance;
          if (mi) {
            mi.setParameter("texture_emissiveMap", value.atlas.texture);
            mi.setParameter("texture_opacityMap", value.atlas.texture);
          }
          if (this._component.enabled && this._component.entity.enabled) {
            this._component.addToLayers();
          }
        }
        if (this.time && this.fps) {
          this.time = this.time;
        } else {
          this.frame = this.frame;
        }
      }
    }
  }
  /**
   * Gets the current sprite used to play the animation.
   *
   * @type {Sprite}
   */
  get sprite() {
    return this._sprite;
  }
  /**
   * Sets the id of the sprite asset used to play the animation.
   *
   * @type {number}
   */
  set spriteAsset(value) {
    const assets = this._component.system.app.assets;
    let id = value;
    if (value instanceof Asset) {
      id = value.id;
    }
    if (this._spriteAsset !== id) {
      if (this._spriteAsset) {
        const prev = assets.get(this._spriteAsset);
        if (prev) {
          this._unbindSpriteAsset(prev);
        }
      }
      this._spriteAsset = id;
      if (this._spriteAsset) {
        const asset = assets.get(this._spriteAsset);
        if (!asset) {
          this.sprite = null;
          assets.on(`add:${this._spriteAsset}`, this._onSpriteAssetAdded, this);
        } else {
          this._bindSpriteAsset(asset);
        }
      } else {
        this.sprite = null;
      }
    }
  }
  /**
   * Gets the id of the sprite asset used to play the animation.
   *
   * @type {number}
   */
  get spriteAsset() {
    return this._spriteAsset;
  }
  /**
   * Sets the current time of the animation in seconds.
   *
   * @type {number}
   */
  set time(value) {
    this._setTime(value);
    if (this._sprite) {
      this.frame = Math.min(this._sprite.frameKeys.length - 1, Math.floor(this._time * Math.abs(this.fps)));
    } else {
      this.frame = 0;
    }
  }
  /**
   * Gets the current time of the animation in seconds.
   *
   * @type {number}
   */
  get time() {
    return this._time;
  }
  // When sprite asset is added bind it
  _onSpriteAssetAdded(asset) {
    this._component.system.app.assets.off(`add:${asset.id}`, this._onSpriteAssetAdded, this);
    if (this._spriteAsset === asset.id) {
      this._bindSpriteAsset(asset);
    }
  }
  // Hook up event handlers on sprite asset
  _bindSpriteAsset(asset) {
    asset.on("load", this._onSpriteAssetLoad, this);
    asset.on("remove", this._onSpriteAssetRemove, this);
    if (asset.resource) {
      this._onSpriteAssetLoad(asset);
    } else {
      this._component.system.app.assets.load(asset);
    }
  }
  _unbindSpriteAsset(asset) {
    if (!asset) {
      return;
    }
    asset.off("load", this._onSpriteAssetLoad, this);
    asset.off("remove", this._onSpriteAssetRemove, this);
    if (asset.resource && !asset.resource.atlas) {
      this._component.system.app.assets.off(`load:${asset.data.textureAtlasAsset}`, this._onTextureAtlasLoad, this);
    }
  }
  // When sprite asset is loaded make sure the texture atlas asset is loaded too
  // If so then set the sprite, otherwise wait for the atlas to be loaded first
  _onSpriteAssetLoad(asset) {
    if (!asset.resource) {
      this.sprite = null;
    } else {
      if (!asset.resource.atlas) {
        const atlasAssetId = asset.data.textureAtlasAsset;
        const assets = this._component.system.app.assets;
        assets.off(`load:${atlasAssetId}`, this._onTextureAtlasLoad, this);
        assets.once(`load:${atlasAssetId}`, this._onTextureAtlasLoad, this);
      } else {
        this.sprite = asset.resource;
      }
    }
  }
  // When atlas is loaded try to reset the sprite asset
  _onTextureAtlasLoad(atlasAsset) {
    const spriteAsset = this._spriteAsset;
    if (spriteAsset instanceof Asset) {
      this._onSpriteAssetLoad(spriteAsset);
    } else {
      this._onSpriteAssetLoad(this._component.system.app.assets.get(spriteAsset));
    }
  }
  _onSpriteAssetRemove(asset) {
    this.sprite = null;
  }
  // If the meshes are re-created make sure
  // we update them in the mesh instance
  _onSpriteMeshesChange() {
    if (this._component.currentClip === this) {
      this._component._showFrame(this.frame);
    }
  }
  // Update frame if ppu changes for 9-sliced sprites
  _onSpritePpuChanged() {
    if (this._component.currentClip === this) {
      if (this.sprite.renderMode !== SPRITE_RENDERMODE_SIMPLE) {
        this._component._showFrame(this.frame);
      }
    }
  }
  /**
   * Advances the animation, looping if necessary.
   *
   * @param {number} dt - The delta time.
   * @private
   */
  _update(dt) {
    if (this.fps === 0) return;
    if (!this._playing || this._paused || !this._sprite) return;
    const dir = this.fps < 0 ? -1 : 1;
    const time = this._time + dt * this._component.speed * dir;
    const duration = this.duration;
    const end = time > duration || time < 0;
    this._setTime(time);
    let frame = this.frame;
    if (this._sprite) {
      frame = Math.floor(this._sprite.frameKeys.length * this._time / duration);
    } else {
      frame = 0;
    }
    if (frame !== this._frame) {
      this._setFrame(frame);
    }
    if (end) {
      if (this.loop) {
        this.fire("loop");
        this._component.fire("loop", this);
      } else {
        this._playing = false;
        this._paused = false;
        this.fire("end");
        this._component.fire("end", this);
      }
    }
  }
  _setTime(value) {
    this._time = value;
    const duration = this.duration;
    if (this._time < 0) {
      if (this.loop) {
        this._time = this._time % duration + duration;
      } else {
        this._time = 0;
      }
    } else if (this._time > duration) {
      if (this.loop) {
        this._time %= duration;
      } else {
        this._time = duration;
      }
    }
  }
  _setFrame(value) {
    if (this._sprite) {
      this._frame = math.clamp(value, 0, this._sprite.frameKeys.length - 1);
    } else {
      this._frame = value;
    }
    if (this._component.currentClip === this) {
      this._component._showFrame(this._frame);
    }
  }
  _destroy() {
    if (this._spriteAsset) {
      const assets = this._component.system.app.assets;
      this._unbindSpriteAsset(assets.get(this._spriteAsset));
    }
    if (this._sprite) {
      this.sprite = null;
    }
    if (this._spriteAsset) {
      this.spriteAsset = null;
    }
  }
  /**
   * Plays the animation. If it's already playing then this does nothing.
   */
  play() {
    if (this._playing) {
      return;
    }
    this._playing = true;
    this._paused = false;
    this.frame = 0;
    this.fire("play");
    this._component.fire("play", this);
  }
  /**
   * Pauses the animation.
   */
  pause() {
    if (!this._playing || this._paused) {
      return;
    }
    this._paused = true;
    this.fire("pause");
    this._component.fire("pause", this);
  }
  /**
   * Resumes the paused animation.
   */
  resume() {
    if (!this._paused) return;
    this._paused = false;
    this.fire("resume");
    this._component.fire("resume", this);
  }
  /**
   * Stops the animation and resets the animation to the first frame.
   */
  stop() {
    if (!this._playing) return;
    this._playing = false;
    this._paused = false;
    this._time = 0;
    this.frame = 0;
    this.fire("stop");
    this._component.fire("stop", this);
  }
}
/**
 * Fired when the clip starts playing.
 *
 * @event
 * @example
 * clip.on('play', () => {
 *     console.log('Clip started playing');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_PLAY", "play");
/**
 * Fired when the clip is paused.
 *
 * @event
 * @example
 * clip.on('pause', () => {
 *     console.log('Clip paused');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_PAUSE", "pause");
/**
 * Fired when the clip is resumed.
 *
 * @event
 * @example
 * clip.on('resume', () => {
 *     console.log('Clip resumed');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_RESUME", "resume");
/**
 * Fired when the clip is stopped.
 *
 * @event
 * @example
 * clip.on('stop', () => {
 *     console.log('Clip stopped');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_STOP", "stop");
/**
 * Fired when the clip stops playing because it reached its end.
 *
 * @event
 * @example
 * clip.on('end', () => {
 *     console.log('Clip ended');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_END", "end");
/**
 * Fired when the clip reached the end of its current loop.
 *
 * @event
 * @example
 * clip.on('loop', () => {
 *     console.log('Clip looped');
 * });
 */
__publicField(SpriteAnimationClip, "EVENT_LOOP", "loop");
export {
  SpriteAnimationClip
};
