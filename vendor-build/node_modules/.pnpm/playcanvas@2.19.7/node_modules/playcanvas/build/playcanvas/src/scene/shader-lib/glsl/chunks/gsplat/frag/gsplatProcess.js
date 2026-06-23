var gsplatProcess_default = `
uniform uint splatTextureSize;
uniform uint dstTextureSize;
uniform uint srcNumSplats;
uniform uint dstNumSplats;
#include "gsplatSplatVS"
#include "gsplatProcessInputVS"
#include "gsplatProcessOutputVS"
#include "gsplatProcessReadVS"
#include "gsplatProcessChunk"
void main(void) {
	ivec2 fragCoords = ivec2(gl_FragCoord.xy);
	
	uint splatIndex = uint(fragCoords.y * int(dstTextureSize) + fragCoords.x);
	
	if (splatIndex >= dstNumSplats) discard;
	
	setSplat(splatIndex);
	
	process();
}
`;
export {
	gsplatProcess_default as default
};
