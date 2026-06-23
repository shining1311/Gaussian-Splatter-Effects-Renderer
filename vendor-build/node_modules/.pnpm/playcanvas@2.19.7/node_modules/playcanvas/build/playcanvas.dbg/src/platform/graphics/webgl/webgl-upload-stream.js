var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug } from "../../../core/debug.js";
class WebglUploadStream {
  /**
   * @param {UploadStream} uploadStream - The upload stream.
   */
  constructor(uploadStream) {
    /**
     * Available PBOs ready for immediate use.
     *
     * @type {Array<{pbo: WebGLBuffer, size: number}>}
     */
    __publicField(this, "availablePBOs", []);
    /**
     * PBOs currently in use by the GPU.
     *
     * @type {Array<{pbo: WebGLBuffer, size: number, sync: WebGLSync}>}
     */
    __publicField(this, "pendingPBOs", []);
    this.uploadStream = uploadStream;
    this.useSingleBuffer = uploadStream.useSingleBuffer;
  }
  destroy() {
    const gl = this.uploadStream.device.gl;
    this.availablePBOs.forEach((info) => gl.deleteBuffer(info.pbo));
    this.pendingPBOs.forEach((item) => {
      if (item.sync) gl.deleteSync(item.sync);
      gl.deleteBuffer(item.pbo);
    });
  }
  /**
   * Handles device lost event by clearing all PBO and sync object arrays.
   *
   * @protected
   */
  _onDeviceLost() {
    this.availablePBOs.length = 0;
    this.pendingPBOs.length = 0;
  }
  /**
   * Update PBOs: poll completed ones and remove undersized buffers.
   *
   * @param {number} minByteSize - Minimum size for buffers to keep. Smaller buffers are destroyed.
   */
  update(minByteSize) {
    const gl = this.uploadStream.device.gl;
    const pending = this.pendingPBOs;
    for (let i = pending.length - 1; i >= 0; i--) {
      const item = pending[i];
      const result = gl.clientWaitSync(item.sync, 0, 0);
      if (result === gl.CONDITION_SATISFIED || result === gl.ALREADY_SIGNALED) {
        gl.deleteSync(item.sync);
        this.availablePBOs.push({ pbo: item.pbo, size: item.size });
        pending.splice(i, 1);
      }
    }
    const available = this.availablePBOs;
    for (let i = available.length - 1; i >= 0; i--) {
      if (available[i].size < minByteSize) {
        gl.deleteBuffer(available[i].pbo);
        available.splice(i, 1);
      }
    }
  }
  /**
   * Upload data to a texture using PBOs (optimized) or direct upload (simple).
   *
   * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
   * @param {Texture} target - The target texture.
   * @param {number} offset - The element offset in the target. Must be a multiple of texture width.
   * @param {number} size - The number of elements to upload. Must be a multiple of texture width.
   */
  upload(data, target, offset, size) {
    if (this.useSingleBuffer) {
      this.uploadDirect(data, target, offset, size);
    } else {
      this.uploadPBO(data, target, offset, size);
    }
  }
  /**
   * Direct texture upload via gl.texImage2D — uploads the full buffer with a
   * fresh storage allocation each call. Bypasses the engine's Texture.upload
   * path (which uses texSubImage2D after the first frame). This avoids the
   * texSubImage2D path's stall on multi-MB integer-format uploads through
   * Chrome's renderer→GPU IPC on some drivers.
   *
   * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
   * @param {Texture} target - The target texture.
   * @param {number} offset - The element offset in the target.
   * @param {number} size - The number of elements to upload.
   * @private
   */
  uploadDirect(data, target, offset, size) {
    Debug.assert(offset === 0, "Direct texture upload with non-zero offset is not supported. Use PBO mode instead.");
    const device = this.uploadStream.device;
    const gl = device.gl;
    const impl = target.impl;
    device.setTexture(target, 0);
    device.activeTexture(0);
    device.bindTexture(target);
    device.setUnpackFlipY(false);
    device.setUnpackPremultiplyAlpha(false);
    device.setUnpackAlignment(data.BYTES_PER_ELEMENT);
    let src = data;
    if (impl._glPixelType === gl.UNSIGNED_BYTE && data.BYTES_PER_ELEMENT !== 1) {
      const byteSize = size * data.BYTES_PER_ELEMENT;
      src = new Uint8Array(data.buffer, data.byteOffset, byteSize);
    }
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      impl._glInternalFormat,
      target.width,
      target.height,
      0,
      impl._glFormat,
      impl._glPixelType,
      src
    );
    impl._glCreated = true;
  }
  /**
   * PBO-based upload with orphaning (optimized, potentially non-blocking).
   *
   * @param {Uint8Array|Uint32Array|Float32Array} data - The data to upload.
   * @param {import('../texture.js').Texture} target - The target texture.
   * @param {number} offset - The element offset in the target.
   * @param {number} size - The number of elements to upload.
   * @private
   */
  uploadPBO(data, target, offset, size) {
    const device = this.uploadStream.device;
    const gl = device.gl;
    const width = target.width;
    const byteSize = size * data.BYTES_PER_ELEMENT;
    this.update(byteSize);
    Debug.assert(offset % width === 0, `Upload offset (${offset}) must be a multiple of texture width (${width}) for row alignment`);
    Debug.assert(size % width === 0, `Upload size (${size}) must be a multiple of texture width (${width}) for row alignment`);
    const startY = offset / width;
    const height = size / width;
    const pboInfo = this.availablePBOs.pop() ?? (() => {
      const pbo = gl.createBuffer();
      return { pbo, size: byteSize };
    })();
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pboInfo.pbo);
    gl.bufferData(gl.PIXEL_UNPACK_BUFFER, byteSize, gl.STREAM_DRAW);
    gl.bufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, new Uint8Array(data.buffer, data.byteOffset, byteSize));
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    device.setTexture(target, 0);
    device.activeTexture(0);
    device.bindTexture(target);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pboInfo.pbo);
    device.setUnpackFlipY(false);
    device.setUnpackPremultiplyAlpha(false);
    device.setUnpackAlignment(data.BYTES_PER_ELEMENT);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
    const impl = target.impl;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, startY, width, height, impl._glFormat, impl._glPixelType, 0);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    this.pendingPBOs.push({ pbo: pboInfo.pbo, size: byteSize, sync });
    gl.flush();
  }
}
export {
  WebglUploadStream
};
