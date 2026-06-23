var gsplatCopyInstancedQuad_default = `
attribute vertex_position: vec2f;
var uSubDrawData: texture_2d<u32>;
uniform uTextureSize: vec2i;
uniform uSubDrawBase: i32;
varying @interpolate(flat) vSubDraw: vec4i;
@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
	var output: VertexOutput;
	let subDrawWidth = i32(textureDimensions(uSubDrawData, 0).x);
	let instIdx = i32(input.instanceIndex) + uniform.uSubDrawBase;
	let data = textureLoad(uSubDrawData, vec2i(instIdx % subDrawWidth, instIdx / subDrawWidth), 0);
	let rowStart = i32(data.r & 0xFFFFu);
	let numRows = i32(data.r >> 16u);
	let colStart = i32(data.g);
	let colEnd = i32(data.b);
	let sourceBase = i32(data.a);
	let u = f32(i32(input.vertexIndex) & 1);
	let v = f32(i32(input.vertexIndex) >> 1u);
	let ndc = vec4f(f32(colStart), f32(colEnd), f32(rowStart), f32(rowStart + numRows)) / vec4f(f32(uniform.uTextureSize.x), f32(uniform.uTextureSize.x), f32(uniform.uTextureSize.y), f32(uniform.uTextureSize.y)) * 2.0 - 1.0;
	output.position = vec4f(mix(ndc.x, ndc.y, u), mix(-ndc.z, -ndc.w, v), 0.5, 1.0);
	output.vSubDraw = vec4i(sourceBase, colStart, colEnd - colStart, rowStart);
	return output;
}
`;
export {
	gsplatCopyInstancedQuad_default as default
};
