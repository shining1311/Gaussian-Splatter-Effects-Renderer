var particleAnimFrameLoop_default = `
	float animFrame = floor(mod(texCoordsAlphaLife.w * animTexParams.y + animTexParams.x, animTexParams.z + 1.0));
`;
export {
	particleAnimFrameLoop_default as default
};
