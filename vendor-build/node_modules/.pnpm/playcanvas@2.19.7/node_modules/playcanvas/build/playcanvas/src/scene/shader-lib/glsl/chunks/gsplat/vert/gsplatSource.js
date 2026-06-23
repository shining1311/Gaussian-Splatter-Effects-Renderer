var gsplatSource_default = `
attribute vec3 vertex_position;
uniform uint numSplats;
uniform highp usampler2D splatOrder;
bool initSource(out SplatSource source) {
	source.order = uint(gl_InstanceID) * {GSPLAT_INSTANCE_SIZE}u + uint(vertex_position.z);
	if (source.order >= numSplats) {
		return false;
	}
	ivec2 orderUV = ivec2(source.order % splatTextureSize, source.order / splatTextureSize);
	uint splatId = texelFetch(splatOrder, orderUV, 0).r;
	setSplat(splatId);
	source.cornerUV = vertex_position.xy;
	return true;
}
`;
export {
	gsplatSource_default as default
};
