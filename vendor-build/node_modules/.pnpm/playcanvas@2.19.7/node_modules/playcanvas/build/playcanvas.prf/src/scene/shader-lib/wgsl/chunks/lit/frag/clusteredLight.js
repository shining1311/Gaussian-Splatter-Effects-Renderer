var clusteredLight_default = `
#include "lightBufferDefinesPS"
#include "clusteredLightUtilsPS"
#ifdef CLUSTER_COOKIES
	#include "clusteredLightCookiesPS"
#endif
#ifdef CLUSTER_SHADOWS
	#include "clusteredLightShadowsPS"
#endif
var clusterWorldTexture: texture_2d<u32>;
var lightsTexture: texture_2d<uff>;
#ifdef CLUSTER_SHADOWS
	var shadowAtlasTexture: texture_depth_2d;
	var shadowAtlasTextureSampler: sampler_comparison;
#endif
#ifdef CLUSTER_COOKIES
	var cookieAtlasTexture: texture_2d<f32>;
	var cookieAtlasTextureSampler: sampler;
#endif
uniform clusterMaxCells: i32;
uniform numClusteredLights: i32;
uniform clusterTextureWidth: i32;
uniform clusterCellsCountByBoundsSize: vec3f;
uniform clusterBoundsMin: vec3f;
uniform clusterBoundsDelta: vec3f;
uniform clusterCellsDot: vec3i;
uniform clusterCellsMax: vec3i;
uniform shadowAtlasParams: vec2f;
struct ClusterLightData {
	position: vec3f,
	lightIndex: i32,
	direction: vec3f,
	shape: u32,
	color: vec3f,
	shadowIntensity: f32,
	range: f32,
	biasesData: f32,
	cookieIntensity: f32,
	isSpot: bool,
	falloffModeLinear: bool,
	isDynamic: bool,
	isLightmapped: bool
}
struct ClusterLightSpotData {
	innerConeAngleCos: f32,
	outerConeAngleCos: f32
}
struct ClusterLightAreaData {
	halfWidth: vec3f,
	halfHeight: vec3f
}
struct ClusterLightShadowData {
	shadowBias: f32,
	shadowNormalBias: f32
}
var<private> lightProjectionMatrix: mat4x4f;
var<private> clusterLightData_flags: u32;
var<private> clusterLightData_anglesData: f32;
var<private> clusterLightData_colorBFlagsData: u32;
fn sampleLightTextureF(lightIndex: i32, index: i32) -> vec4f {
	return textureLoad(lightsTexture, vec2<i32>(index, lightIndex), 0);
}
fn decodeClusterLightCore(lightIndex: i32) -> ClusterLightData {
	var clusterLightData: ClusterLightData;
	clusterLightData.lightIndex = lightIndex;
	let halfData: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_COLOR_ANGLES_BIAS});
	clusterLightData_anglesData = halfData.z;
	clusterLightData.biasesData = halfData.w;
	clusterLightData_colorBFlagsData = bitcast<u32>(halfData.y);
	let colorRG: vec2f = unpack2x16float(bitcast<u32>(halfData.x));
	let colorB_flags: vec2f = unpack2x16float(clusterLightData_colorBFlagsData);
	clusterLightData.color = vec3f(colorRG, colorB_flags.x) * {LIGHT_COLOR_DIVIDER};
	let lightPosRange: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_POSITION_RANGE});
	clusterLightData.position = lightPosRange.xyz;
	clusterLightData.range = lightPosRange.w;
	let lightDir_Flags: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_DIRECTION_FLAGS});
	clusterLightData.direction = lightDir_Flags.xyz;
	clusterLightData_flags = bitcast<u32>(lightDir_Flags.w);
	clusterLightData.isSpot = (clusterLightData_flags & (1u << 30u)) != 0u;
	clusterLightData.shape = (clusterLightData_flags >> 28u) & 0x3u;
	clusterLightData.falloffModeLinear = (clusterLightData_flags & (1u << 27u)) == 0u;
	clusterLightData.shadowIntensity = f32((clusterLightData_flags >> 0u) & 0xFFu) / 255.0;
	clusterLightData.cookieIntensity = f32((clusterLightData_flags >> 8u) & 0xFFu) / 255.0;
	clusterLightData.isDynamic = (clusterLightData_flags & (1u << 22u)) != 0u;
	clusterLightData.isLightmapped = (clusterLightData_flags & (1u << 21u)) != 0u;
	return clusterLightData;
}
fn decodeClusterLightSpot() -> ClusterLightSpotData {
	let angleFlags: u32 = (clusterLightData_colorBFlagsData >> 16u) & 0xFFFFu;
	let angleValues: vec2f = unpack2x16float(bitcast<u32>(clusterLightData_anglesData));
	let innerVal: f32 = angleValues.x;
	let outerVal: f32 = angleValues.y;
	let innerIsVersine: bool = (angleFlags & 1u) != 0u;
	let outerIsVersine: bool = ((angleFlags >> 1u) & 1u) != 0u;
	return ClusterLightSpotData(
		select(innerVal, 1.0 - innerVal, innerIsVersine),
		select(outerVal, 1.0 - outerVal, outerIsVersine)
	);
}
fn decodeClusterLightOmniAtlasViewport(lightIndex: i32) -> vec3f {
	return sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_PROJ_MAT_0}).xyz;
}
fn decodeClusterLightAreaData(lightIndex: i32) -> ClusterLightAreaData {
	return ClusterLightAreaData(
		sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_AREA_DATA_WIDTH}).xyz,
		sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_AREA_DATA_HEIGHT}).xyz
	);
}
fn decodeClusterLightProjectionMatrixData(lightIndex: i32) -> mat4x4f {
	let m0: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_PROJ_MAT_0});
	let m1: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_PROJ_MAT_1});
	let m2: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_PROJ_MAT_2});
	let m3: vec4f = sampleLightTextureF(lightIndex, {CLUSTER_TEXTURE_PROJ_MAT_3});
	return mat4x4f(m0, m1, m2, m3);
}
fn decodeClusterLightShadowData(biasesData: f32) -> ClusterLightShadowData {
	let biases: vec2f = unpack2x16float(bitcast<u32>(biasesData));
	return ClusterLightShadowData(biases.x, biases.y);
}
fn decodeClusterLightCookieData() -> vec4f {
	let cookieFlags: u32 = (clusterLightData_flags >> 23u) & 0x0Fu;
	let mask_uvec: vec4<u32> = vec4<u32>(cookieFlags) & vec4<u32>(1u, 2u, 4u, 8u);
	return step(vec4f(1.0), vec4f(mask_uvec));
}
fn evaluateLight(
	light: ClusterLightData,
	worldNormal: vec3f,
	viewDir: vec3f,
	reflectionDir: vec3f,
#if defined(LIT_CLEARCOAT)
	clearcoatReflectionDir: vec3f,
#endif
	gloss: f32,
	specularity: vec3f,
	geometricNormal: vec3f,
	tbn: mat3x3f,
#if defined(LIT_IRIDESCENCE)
	iridescenceFresnel: vec3f,
#endif
	clearcoat_worldNormal: vec3f,
	clearcoat_gloss: f32,
	sheen_gloss: f32,
	iridescence_intensity: f32
) {
	var cookieAttenuation: vec3f = vec3f(1.0);
	var diffuseAttenuation: f32 = 1.0;
	var falloffAttenuation: f32 = 1.0;
	let lightDirW: vec3f = evalOmniLight(light.position);
	let lightDirNormW: vec3f = normalize(lightDirW);
	#ifdef CLUSTER_AREALIGHTS
	if (light.shape != {LIGHTSHAPE_PUNCTUAL}) {
		let areaData: ClusterLightAreaData = decodeClusterLightAreaData(light.lightIndex);
		if (light.shape == {LIGHTSHAPE_RECT}) {
			calcRectLightValues(light.position, areaData.halfWidth, areaData.halfHeight);
		} else if (light.shape == {LIGHTSHAPE_DISK}) {
			calcDiskLightValues(light.position, areaData.halfWidth, areaData.halfHeight);
		} else {
			calcSphereLightValues(light.position, areaData.halfWidth, areaData.halfHeight);
		}
		falloffAttenuation = getFalloffWindow(light.range, lightDirW);
	} else
	#endif
	{
		if (light.falloffModeLinear) {
			falloffAttenuation = getFalloffLinear(light.range, lightDirW);
		} else {
			falloffAttenuation = getFalloffInvSquared(light.range, lightDirW);
		}
	}
	if (falloffAttenuation > 0.00001) {
		#ifdef CLUSTER_AREALIGHTS
		if (light.shape != {LIGHTSHAPE_PUNCTUAL}) {
			if (light.shape == {LIGHTSHAPE_RECT}) {
				diffuseAttenuation = getRectLightDiffuse(worldNormal, viewDir, lightDirW, lightDirNormW) * 16.0;
			} else if (light.shape == {LIGHTSHAPE_DISK}) {
				diffuseAttenuation = getDiskLightDiffuse(worldNormal, viewDir, lightDirW, lightDirNormW) * 16.0;
			} else {
				diffuseAttenuation = getSphereLightDiffuse(worldNormal, viewDir, lightDirW, lightDirNormW) * 16.0;
			}
		} else
		#endif
		{
			falloffAttenuation = falloffAttenuation * getLightDiffuse(worldNormal, viewDir, lightDirNormW);
		}
		if (light.isSpot) {
			let spotData: ClusterLightSpotData = decodeClusterLightSpot();
			falloffAttenuation = falloffAttenuation * getSpotEffect(light.direction, spotData.innerConeAngleCos, spotData.outerConeAngleCos, lightDirNormW);
		}
		#if defined(CLUSTER_COOKIES) || defined(CLUSTER_SHADOWS)
		if (falloffAttenuation > 0.00001) {
			if (light.shadowIntensity > 0.0 || light.cookieIntensity > 0.0) {
				var omniAtlasViewport: vec3f = vec3f(0.0);
				if (light.isSpot) {
					lightProjectionMatrix = decodeClusterLightProjectionMatrixData(light.lightIndex);
				} else {
					omniAtlasViewport = decodeClusterLightOmniAtlasViewport(light.lightIndex);
				}
				let shadowTextureResolution: f32 = uniform.shadowAtlasParams.x;
				let shadowEdgePixels: f32 = uniform.shadowAtlasParams.y;
				#ifdef CLUSTER_COOKIES
				if (light.cookieIntensity > 0.0) {
					let cookieChannelMask: vec4f = decodeClusterLightCookieData();
					if (light.isSpot) {
						cookieAttenuation = getCookie2DClustered(cookieAtlasTexture, cookieAtlasTextureSampler, lightProjectionMatrix, vPositionW, light.cookieIntensity, cookieChannelMask);
					} else {
						cookieAttenuation = getCookieCubeClustered(cookieAtlasTexture, cookieAtlasTextureSampler, lightDirW, light.cookieIntensity, cookieChannelMask, shadowTextureResolution, shadowEdgePixels, omniAtlasViewport);
					}
				}
				#endif
				#ifdef CLUSTER_SHADOWS
				if (light.shadowIntensity > 0.0) {
					let shadowData: ClusterLightShadowData = decodeClusterLightShadowData(light.biasesData);
					let shadowParams: vec4f = vec4f(shadowTextureResolution, shadowData.shadowNormalBias, shadowData.shadowBias, 1.0 / light.range);
					if (light.isSpot) {
						let shadowCoord: vec3f = getShadowCoordPerspZbufferNormalOffset(lightProjectionMatrix, shadowParams, geometricNormal);
						#if defined(CLUSTER_SHADOW_TYPE_PCF1)
							let shadow: f32 = getShadowSpotClusteredPCF1(shadowAtlasTexture, shadowAtlasTextureSampler, shadowCoord, shadowParams);
						#elif defined(CLUSTER_SHADOW_TYPE_PCF3)
							let shadow: f32 = getShadowSpotClusteredPCF3(shadowAtlasTexture, shadowAtlasTextureSampler, shadowCoord, shadowParams);
						#elif defined(CLUSTER_SHADOW_TYPE_PCF5)
							let shadow: f32 = getShadowSpotClusteredPCF5(shadowAtlasTexture, shadowAtlasTextureSampler, shadowCoord, shadowParams);
						#elif defined(CLUSTER_SHADOW_TYPE_PCSS)
							let shadow: f32 = getShadowSpotClusteredPCSS(shadowAtlasTexture, shadowAtlasTextureSampler, shadowCoord, shadowParams);
						#endif
						falloffAttenuation = falloffAttenuation * mix(1.0, shadow, light.shadowIntensity);
					} else {
						let dir: vec3f = normalOffsetPointShadow(shadowParams, light.position, lightDirW, lightDirNormW, geometricNormal);
						#if defined(CLUSTER_SHADOW_TYPE_PCF1)
							let shadow: f32 = getShadowOmniClusteredPCF1(shadowAtlasTexture, shadowAtlasTextureSampler, shadowParams, omniAtlasViewport, shadowEdgePixels, dir);
						#elif defined(CLUSTER_SHADOW_TYPE_PCF3)
							let shadow: f32 = getShadowOmniClusteredPCF3(shadowAtlasTexture, shadowAtlasTextureSampler, shadowParams, omniAtlasViewport, shadowEdgePixels, dir);
						#elif defined(CLUSTER_SHADOW_TYPE_PCF5)
							let shadow: f32 = getShadowOmniClusteredPCF5(shadowAtlasTexture, shadowAtlasTextureSampler, shadowParams, omniAtlasViewport, shadowEdgePixels, dir);
						#endif
						falloffAttenuation = falloffAttenuation * mix(1.0, shadow, light.shadowIntensity);
					}
				}
				#endif
			}
		}
		#endif
		#ifdef CLUSTER_AREALIGHTS
		if (light.shape != {LIGHTSHAPE_PUNCTUAL}) {
			{
				var areaDiffuse: vec3f = (diffuseAttenuation * falloffAttenuation) * light.color * cookieAttenuation;
				#if defined(LIT_SPECULAR)
					areaDiffuse = mix(areaDiffuse, vec3f(0.0), dLTCSpecFres);
				#endif
				dDiffuseLight = dDiffuseLight + areaDiffuse;
			}
			#ifdef LIT_SPECULAR
				var areaLightSpecular: f32;
				if (light.shape == {LIGHTSHAPE_RECT}) {
					areaLightSpecular = getRectLightSpecular(worldNormal, viewDir);
				} else if (light.shape == {LIGHTSHAPE_DISK}) {
					areaLightSpecular = getDiskLightSpecular(worldNormal, viewDir);
				} else {
					areaLightSpecular = getSphereLightSpecular(worldNormal, viewDir);
				}
				dSpecularLight = dSpecularLight + dLTCSpecFres * areaLightSpecular * falloffAttenuation * light.color * cookieAttenuation;
				#ifdef LIT_CLEARCOAT
					var areaLightSpecularCC: f32;
					if (light.shape == {LIGHTSHAPE_RECT}) {
						areaLightSpecularCC = getRectLightSpecular(clearcoat_worldNormal, viewDir);
					} else if (light.shape == {LIGHTSHAPE_DISK}) {
						areaLightSpecularCC = getDiskLightSpecular(clearcoat_worldNormal, viewDir);
					} else {
						areaLightSpecularCC = getSphereLightSpecular(clearcoat_worldNormal, viewDir);
					}
					ccSpecularLight = ccSpecularLight + ccLTCSpecFres * areaLightSpecularCC * falloffAttenuation * light.color  * cookieAttenuation;
				#endif
			#endif
		} else
		#endif
		{
			{
				var punctualDiffuse: vec3f = falloffAttenuation * light.color * cookieAttenuation;
				#if defined(CLUSTER_AREALIGHTS)
				#if defined(LIT_SPECULAR)
					punctualDiffuse = mix(punctualDiffuse, vec3f(0.0), specularity);
				#endif
				#endif
				dDiffuseLight = dDiffuseLight + punctualDiffuse;
			}
			#ifdef LIT_SPECULAR
				let halfDir: vec3f = normalize(-lightDirNormW + viewDir);
				#ifdef LIT_SPECULAR_FRESNEL
					dSpecularLight = dSpecularLight +
						getLightSpecular(halfDir, reflectionDir, worldNormal, viewDir, lightDirNormW, gloss, tbn) * falloffAttenuation * light.color * cookieAttenuation *
						getFresnel(
							dot(viewDir, halfDir),
							gloss,
							specularity
						#if defined(LIT_IRIDESCENCE)
							, iridescenceFresnel,
							iridescence_intensity
						#endif
							);
				#else
					dSpecularLight = dSpecularLight + getLightSpecular(halfDir, reflectionDir, worldNormal, viewDir, lightDirNormW, gloss, tbn) * falloffAttenuation * light.color * cookieAttenuation * specularity;
				#endif
				#ifdef LIT_CLEARCOAT
					#ifdef LIT_SPECULAR_FRESNEL
						ccSpecularLight = ccSpecularLight + getLightSpecular(halfDir, clearcoatReflectionDir, clearcoat_worldNormal, viewDir, lightDirNormW, clearcoat_gloss, tbn) * falloffAttenuation * light.color * cookieAttenuation * getFresnelCC(dot(viewDir, halfDir));
					#else
						ccSpecularLight = ccSpecularLight + getLightSpecular(halfDir, clearcoatReflectionDir, clearcoat_worldNormal, viewDir, lightDirNormW, clearcoat_gloss, tbn) * falloffAttenuation * light.color * cookieAttenuation;
					#endif
				#endif
				#ifdef LIT_SHEEN
					sSpecularLight = sSpecularLight + getLightSpecularSheen(halfDir, worldNormal, viewDir, lightDirNormW, sheen_gloss) * falloffAttenuation * light.color * cookieAttenuation;
				#endif
			#endif
		}
	}
	dAtten = falloffAttenuation;
	dLightDirNormW = lightDirNormW;
}
fn evaluateClusterLight(
	lightIndex: i32,
	worldNormal: vec3f,
	viewDir: vec3f,
	reflectionDir: vec3f,
#if defined(LIT_CLEARCOAT)
	clearcoatReflectionDir: vec3f,
#endif
	gloss: f32,
	specularity: vec3f,
	geometricNormal: vec3f,
	tbn: mat3x3f,
#if defined(LIT_IRIDESCENCE)
	iridescenceFresnel: vec3f,
#endif
	clearcoat_worldNormal: vec3f,
	clearcoat_gloss: f32,
	sheen_gloss: f32,
	iridescence_intensity: f32
) {
	let clusterLightData: ClusterLightData = decodeClusterLightCore(lightIndex);
	#ifdef CLUSTER_MESH_DYNAMIC_LIGHTS
		let acceptLightMask: bool = clusterLightData.isDynamic;
	#else
		let acceptLightMask: bool = clusterLightData.isLightmapped;
	#endif
	if (acceptLightMask) {
		evaluateLight(
			clusterLightData,
			worldNormal,
			viewDir,
			reflectionDir,
#if defined(LIT_CLEARCOAT)
			clearcoatReflectionDir,
#endif
			gloss,
			specularity,
			geometricNormal,
			tbn,
#if defined(LIT_IRIDESCENCE)
			iridescenceFresnel,
#endif
			clearcoat_worldNormal,
			clearcoat_gloss,
			sheen_gloss,
			iridescence_intensity
		);
	}
}
fn addClusteredLights(
	worldNormal: vec3f,
	viewDir: vec3f,
	reflectionDir: vec3f,
#if defined(LIT_CLEARCOAT)
	clearcoatReflectionDir: vec3f,
#endif
	gloss: f32,
	specularity: vec3f,
	geometricNormal: vec3f,
	tbn: mat3x3f,
#if defined(LIT_IRIDESCENCE)
	iridescenceFresnel: vec3f,
#endif
	clearcoat_worldNormal: vec3f,
	clearcoat_gloss: f32,
	sheen_gloss: f32,
	iridescence_intensity: f32
) {
	if (uniform.numClusteredLights <= 1) {
		return;
	}
	let cellCoords: vec3i = vec3i(floor((vPositionW - uniform.clusterBoundsMin) * uniform.clusterCellsCountByBoundsSize));
	if (!(any(cellCoords < vec3i(0)) || any(cellCoords >= uniform.clusterCellsMax))) {
		let cellIndex: i32 = cellCoords.x * uniform.clusterCellsDot.x + cellCoords.y * uniform.clusterCellsDot.y + cellCoords.z * uniform.clusterCellsDot.z;
		let clusterV: i32 = cellIndex / uniform.clusterTextureWidth;
		let clusterU: i32 = cellIndex - clusterV * uniform.clusterTextureWidth;
		for (var lightCellIndex: i32 = 0; lightCellIndex < uniform.clusterMaxCells; lightCellIndex = lightCellIndex + 1) {
			let lightIndex: u32 = textureLoad(clusterWorldTexture, vec2<i32>(clusterU + lightCellIndex, clusterV), 0).r;
			if (lightIndex == 0u) {
				break;
			}
			evaluateClusterLight(
				i32(lightIndex),
				worldNormal,
				viewDir,
				reflectionDir,
#if defined(LIT_CLEARCOAT)
				clearcoatReflectionDir,
#endif
				gloss,
				specularity,
				geometricNormal,
				tbn,
#if defined(LIT_IRIDESCENCE)
				iridescenceFresnel,
#endif
				clearcoat_worldNormal,
				clearcoat_gloss,
				sheen_gloss,
				iridescence_intensity
			);
		}
	}
}`;
export {
	clusteredLight_default as default
};
