var skybox_default = `
attribute vec4 aPosition;
uniform mat4 matrix_view;
uniform mat4 matrix_projectionSkybox;
uniform mat3 cubeMapRotationMatrix;
varying vec3 vViewDir;
#ifdef SKY_FISHEYE
	varying vec3 vClipXYW;
#endif
#ifdef PREPASS_PASS
	varying float vLinearDepth;
#endif
#ifdef SKYMESH
	uniform mat4 matrix_model;
	varying vec3 vWorldPos;
#endif
void main(void) {
	mat4 view = matrix_view;
	#ifdef SKYMESH
		vec4 worldPos = matrix_model * aPosition;
		vWorldPos = worldPos.xyz;
		gl_Position = matrix_projectionSkybox * (view * worldPos);
		#ifdef PREPASS_PASS
			vLinearDepth = -(matrix_view * vec4(vWorldPos, 1.0)).z;
		#endif
	#else
		view[3][0] = view[3][1] = view[3][2] = 0.0;
		vViewDir = aPosition.xyz * cubeMapRotationMatrix;
		#ifdef SKY_FISHEYE
			vec4 viewPos = view * aPosition;
			gl_Position = vec4(viewPos.xy, 0.0, -viewPos.z);
			vClipXYW = vec3(gl_Position.xy, gl_Position.w);
		#else
			gl_Position = matrix_projectionSkybox * (view * aPosition);
		#endif
		#ifdef PREPASS_PASS
			vLinearDepth = -gl_Position.w;
		#endif
	#endif
	gl_Position.z = gl_Position.w - 1.0e-7;
}
`;
export {
	skybox_default as default
};
