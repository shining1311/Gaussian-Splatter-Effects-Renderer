var gsplatCopyInstancedQuad_default = `
attribute vec2 vertex_position;
precision highp usampler2D;
uniform usampler2D uSubDrawData;
uniform ivec2 uTextureSize;
uniform int uSubDrawBase;
flat varying ivec4 vSubDraw;
void main(void) {
	int subDrawWidth = textureSize(uSubDrawData, 0).x;
	int idx = gl_InstanceID + uSubDrawBase;
	uvec4 data = texelFetch(uSubDrawData, ivec2(idx % subDrawWidth, idx / subDrawWidth), 0);
	int rowStart = int(data.r & 0xFFFFu);
	int numRows = int(data.r >> 16u);
	int colStart = int(data.g);
	int colEnd = int(data.b);
	int sourceBase = int(data.a);
	float u = float(gl_VertexID & 1);
	float v = float(gl_VertexID >> 1);
	vec4 ndc = vec4(colStart, colEnd, rowStart, rowStart + numRows) / vec4(uTextureSize.x, uTextureSize.x, uTextureSize.y, uTextureSize.y) * 2.0 - 1.0;
	gl_Position = vec4(mix(ndc.x, ndc.y, u), mix(ndc.z, ndc.w, v), 0.5, 1.0);
	vSubDraw = ivec4(sourceBase, colStart, colEnd - colStart, rowStart);
}
`;
export {
	gsplatCopyInstancedQuad_default as default
};
