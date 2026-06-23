var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { BLEND_NONE, DITHER_NONE, FOG_NONE, GAMMA_NONE, REFLECTIONSRC_NONE } from "../../constants.js";
class LitShaderOptions {
  constructor() {
    __publicField(this, "hasTangents", false);
    /**
     * Custom shader chunks that will replace default ones.
     *
     * @type {ShaderChunks|null}
     */
    __publicField(this, "shaderChunks", null);
    // one of the SHADER_ constants
    __publicField(this, "pass", 0);
    /**
     * Enable alpha testing. See {@link Material#alphaTest}.
     */
    __publicField(this, "alphaTest", false);
    /**
     * The value of {@link Material#blendType}.
     *
     * @type {number}
     */
    __publicField(this, "blendType", BLEND_NONE);
    __publicField(this, "separateAmbient", false);
    __publicField(this, "screenSpace", false);
    __publicField(this, "skin", false);
    __publicField(this, "batch", false);
    /**
     * If hardware instancing compatible shader should be generated. Transform is read from
     * per-instance {@link VertexBuffer} instead of shader's uniforms.
     */
    __publicField(this, "useInstancing", false);
    /**
     * If morphing code should be generated to morph positions.
     */
    __publicField(this, "useMorphPosition", false);
    /**
     * If morphing code should be generated to morph normals.
     */
    __publicField(this, "useMorphNormal", false);
    __publicField(this, "useMorphTextureBasedInt", false);
    __publicField(this, "nineSlicedMode", 0);
    __publicField(this, "clusteredLightingEnabled", true);
    __publicField(this, "clusteredLightingCookiesEnabled", false);
    __publicField(this, "clusteredLightingShadowsEnabled", false);
    __publicField(this, "clusteredLightingShadowType", 0);
    __publicField(this, "clusteredLightingAreaLightsEnabled", false);
    __publicField(this, "vertexColors", false);
    __publicField(this, "useVertexColorGamma", false);
    __publicField(this, "lightMapEnabled", false);
    __publicField(this, "dirLightMapEnabled", false);
    __publicField(this, "useHeights", false);
    __publicField(this, "useNormals", false);
    __publicField(this, "useClearCoatNormals", false);
    __publicField(this, "useAo", false);
    __publicField(this, "diffuseMapEnabled", false);
    __publicField(this, "pixelSnap", false);
    /**
     * If ambient spherical harmonics are used. Ambient SH replace prefiltered cubemap ambient on
     * certain platforms (mostly Android) for performance reasons.
     */
    __publicField(this, "ambientSH", false);
    /**
     * Apply SSAO during the lighting.
     */
    __publicField(this, "ssao", false);
    /**
     * The value of {@link StandardMaterial#twoSidedLighting}.
     */
    __publicField(this, "twoSidedLighting", false);
    /**
     * The value of {@link StandardMaterial#occludeDirect}.
     */
    __publicField(this, "occludeDirect", false);
    /**
     * The value of {@link StandardMaterial#occludeSpecular}.
     */
    __publicField(this, "occludeSpecular", 0);
    /**
     * Defines if {@link StandardMaterial#occludeSpecularIntensity} constant should affect specular
     * occlusion.
     */
    __publicField(this, "occludeSpecularFloat", false);
    __publicField(this, "useMsdf", false);
    __publicField(this, "msdfTextAttribute", false);
    /**
     * Enable alpha to coverage. See {@link Material#alphaToCoverage}.
     */
    __publicField(this, "alphaToCoverage", false);
    /**
     * Enable specular fade. See {@link StandardMaterial#opacityFadesSpecular}.
     */
    __publicField(this, "opacityFadesSpecular", false);
    /**
     * Enable opacity dithering. See {@link StandardMaterial#opacityDither}.
     *
     * @type {string}
     */
    __publicField(this, "opacityDither", DITHER_NONE);
    /**
     * Enable opacity shadow dithering. See {@link StandardMaterial#opacityShadowDither}.
     *
     * @type {string}
     */
    __publicField(this, "opacityShadowDither", DITHER_NONE);
    /**
     * The value of {@link StandardMaterial#cubeMapProjection}.
     */
    __publicField(this, "cubeMapProjection", 0);
    /**
     * If any specular or reflections are needed at all.
     */
    __publicField(this, "useSpecular", false);
    __publicField(this, "useSpecularityFactor", false);
    __publicField(this, "enableGGXSpecular", false);
    /**
     * The value of {@link StandardMaterial#fresnelModel}.
     */
    __publicField(this, "fresnelModel", 0);
    /**
     * If refraction is used.
     */
    __publicField(this, "useRefraction", false);
    __publicField(this, "useClearCoat", false);
    __publicField(this, "useSheen", false);
    __publicField(this, "useIridescence", false);
    /**
     * The value of {@link StandardMaterial#useMetalness}.
     */
    __publicField(this, "useMetalness", false);
    __publicField(this, "useDynamicRefraction", false);
    __publicField(this, "dispersion", false);
    /**
     * The type of fog being applied in the shader. See {@link Scene#fog} for the list of possible
     * values.
     *
     * @type {string}
     */
    __publicField(this, "fog", FOG_NONE);
    /**
     * The type of gamma correction being applied in the shader. See
     * {@link CameraComponent#gammaCorrection} for the list of possible values.
     *
     * @type {number}
     */
    __publicField(this, "gamma", GAMMA_NONE);
    /**
     * The type of tone mapping being applied in the shader. See {@link CameraComponent#toneMapping}
     * for the list of possible values.
     */
    __publicField(this, "toneMap", -1);
    /**
     * One of REFLECTIONSRC_*** constants.
     *
     * @type {string}
     */
    __publicField(this, "reflectionSource", REFLECTIONSRC_NONE);
    __publicField(this, "reflectionEncoding", null);
    __publicField(this, "reflectionCubemapEncoding", null);
    /**
     * One of "ambientSH", "envAtlas", "constant".
     */
    __publicField(this, "ambientSource", "constant");
    __publicField(this, "ambientEncoding", null);
    // TODO: add a test for if non skybox cubemaps have rotation (when this is supported) - for now
    // assume no non-skybox cubemap rotation
    /**
     * Skybox intensity factor.
     */
    __publicField(this, "skyboxIntensity", 1);
    /**
     * If cube map rotation is enabled.
     */
    __publicField(this, "useCubeMapRotation", false);
    __publicField(this, "lightMapWithoutAmbient", false);
    __publicField(this, "lights", []);
    __publicField(this, "noShadow", false);
    __publicField(this, "lightMaskDynamic", 0);
    /**
     * Object containing a map of user defined vertex attributes to attached shader semantics.
     *
     * @type {Object<string, string>}
     */
    __publicField(this, "userAttributes", {});
    /**
     * Make vLinearDepth available in the shader.
     */
    __publicField(this, "linearDepth", false);
    /**
     * Shader outputs the accumulated shadow value, used for shadow catcher materials.
     */
    __publicField(this, "shadowCatcher", false);
  }
}
export {
  LitShaderOptions
};
