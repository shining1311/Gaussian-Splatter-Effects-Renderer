var gsplatSource_default = `
attribute vertex_position: vec3f;
#ifdef GSPLAT_INDIRECT_DRAW
	var<storage, read> numSplatsStorage: array<u32>;
	var<storage, read> compactedSplatIds: array<u32>;
#else
	uniform numSplats: u32;
	var<storage, read> splatOrder: array<u32>;
#endif
fn initSource(source: ptr<function, SplatSource>) -> bool {
	source.order = pcInstanceIndex * {GSPLAT_INSTANCE_SIZE}u + u32(vertex_position.z);
	#ifdef GSPLAT_INDIRECT_DRAW
		let numSplats = numSplatsStorage[0];
	#else
		let numSplats = uniform.numSplats;
	#endif
	if (source.order >= numSplats) {
		return false;
	}
	var splatId: u32;
	#ifdef GSPLAT_INDIRECT_DRAW
		splatId = compactedSplatIds[source.order];
	#else
		splatId = splatOrder[source.order];
	#endif
	setSplat(splatId);
	source.cornerUV = half2(vertex_position.xy);
	return true;
}
`;
export {
	gsplatSource_default as default
};
