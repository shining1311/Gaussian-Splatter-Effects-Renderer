var particle_end_default = `
	rgb = addFog(rgb);
	rgb = toneMap(rgb);
	rgb = gammaCorrectOutput(rgb);
	output.color = vec4f(rgb, a);
	return output;
}
`;
export {
	particle_end_default as default
};
