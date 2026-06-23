import { BLEND_NONE, DITHER_NONE, FOG_NONE, GAMMA_NONE, REFLECTIONSRC_NONE } from "../../constants.js";
class LitShaderOptions {
	hasTangents = false;
	shaderChunks = null;
	// one of the SHADER_ constants
	pass = 0;
	alphaTest = false;
	blendType = BLEND_NONE;
	separateAmbient = false;
	screenSpace = false;
	skin = false;
	batch = false;
	useInstancing = false;
	useMorphPosition = false;
	useMorphNormal = false;
	useMorphTextureBasedInt = false;
	nineSlicedMode = 0;
	clusteredLightingEnabled = true;
	clusteredLightingCookiesEnabled = false;
	clusteredLightingShadowsEnabled = false;
	clusteredLightingShadowType = 0;
	clusteredLightingAreaLightsEnabled = false;
	vertexColors = false;
	useVertexColorGamma = false;
	lightMapEnabled = false;
	dirLightMapEnabled = false;
	useHeights = false;
	useNormals = false;
	useClearCoatNormals = false;
	useAo = false;
	diffuseMapEnabled = false;
	pixelSnap = false;
	ambientSH = false;
	ssao = false;
	twoSidedLighting = false;
	occludeDirect = false;
	occludeSpecular = 0;
	occludeSpecularFloat = false;
	useMsdf = false;
	msdfTextAttribute = false;
	alphaToCoverage = false;
	opacityFadesSpecular = false;
	opacityDither = DITHER_NONE;
	opacityShadowDither = DITHER_NONE;
	cubeMapProjection = 0;
	useSpecular = false;
	useSpecularityFactor = false;
	enableGGXSpecular = false;
	fresnelModel = 0;
	useRefraction = false;
	useClearCoat = false;
	useSheen = false;
	useIridescence = false;
	useMetalness = false;
	useDynamicRefraction = false;
	dispersion = false;
	fog = FOG_NONE;
	gamma = GAMMA_NONE;
	toneMap = -1;
	reflectionSource = REFLECTIONSRC_NONE;
	reflectionEncoding = null;
	reflectionCubemapEncoding = null;
	ambientSource = "constant";
	ambientEncoding = null;
	// TODO: add a test for if non skybox cubemaps have rotation (when this is supported) - for now
	// assume no non-skybox cubemap rotation
	skyboxIntensity = 1;
	useCubeMapRotation = false;
	lightMapWithoutAmbient = false;
	lights = [];
	noShadow = false;
	lightMaskDynamic = 0;
	userAttributes = {};
	linearDepth = false;
	shadowCatcher = false;
}
export {
	LitShaderOptions
};
