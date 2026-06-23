var particleAnimFrameLoop_default = `
	let animFrame: f32 = floor((output.texCoordsAlphaLife.w * uniform.animTexParams.y + uniform.animTexParams.x) % (uniform.animTexParams.z + 1.0));	
`;
export {
	particleAnimFrameLoop_default as default
};
