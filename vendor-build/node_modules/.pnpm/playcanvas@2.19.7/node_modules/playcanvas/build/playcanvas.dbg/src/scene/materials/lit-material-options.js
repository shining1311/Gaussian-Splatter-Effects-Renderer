var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { LitShaderOptions } from "../shader-lib/programs/lit-shader-options.js";
class LitMaterialOptions {
  constructor() {
    // array of booleans indicating which UV channels are used by the material
    __publicField(this, "usedUvs");
    // custom GLSL shader chunk to be added to the shader
    __publicField(this, "shaderChunkGLSL");
    // custom WGSL shader chunk to be added to the shader
    __publicField(this, "shaderChunkWGSL");
    // lit options
    __publicField(this, "litOptions", new LitShaderOptions());
  }
}
export {
  LitMaterialOptions
};
