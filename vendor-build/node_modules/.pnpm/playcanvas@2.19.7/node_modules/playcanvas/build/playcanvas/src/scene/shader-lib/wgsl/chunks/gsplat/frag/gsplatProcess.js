var gsplatProcess_default = `
uniform splatTextureSize: u32;
uniform dstTextureSize: u32;
uniform srcNumSplats: u32;
uniform dstNumSplats: u32;
#include "gsplatSplatVS"
#include "gsplatProcessInputVS"
var<private> processOutput: FragmentOutput;
#include "gsplatProcessOutputVS"
#include "gsplatProcessReadVS"
#include "gsplatProcessChunk"
@fragment
fn fragmentMain(input: FragmentInput) -> FragmentOutput {
	let fragCoords = vec2i(input.position.xy);
	
	let splatIndex = u32(fragCoords.y * i32(uniform.dstTextureSize) + fragCoords.x);
	
	if (splatIndex >= uniform.dstNumSplats) {
		discard;
	}
	
	setSplat(splatIndex);
	
	process();
	
	return processOutput;
}
`;
export {
	gsplatProcess_default as default
};
