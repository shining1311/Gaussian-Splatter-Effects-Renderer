/**
 * Represents the raw audio data of a playable sound. A Sound is the resource of an audio
 * {@link Asset}. An audio asset can be assigned to a {@link SoundSlot} owned by a
 * {@link SoundComponent}.
 *
 * @category Sound
 */
export class Sound {
    /**
     * Create a new Sound instance.
     *
     * @param {AudioBuffer} buffer - The decoded audio data.
     */
    constructor(buffer: AudioBuffer);
    /**
     * Contains the decoded audio data.
     *
     * @type {AudioBuffer}
     */
    buffer: AudioBuffer;
    /**
     * Gets the duration of the sound. If the sound is not loaded it returns 0.
     *
     * @type {number}
     */
    get duration(): number;
}
