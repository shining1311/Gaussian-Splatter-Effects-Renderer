var cookie_blit_2d_default = `
	varying vec2 uv0;
	uniform sampler2D blitTexture;
	void main(void) {
		gl_FragColor = texture2D(blitTexture, uv0);
	}
`;
export {
	cookie_blit_2d_default as default
};
