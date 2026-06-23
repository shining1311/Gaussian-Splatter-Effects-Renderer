var gsplatCorner_default = `
uniform vec4 viewport_size;
uniform float minPixelSize;
void computeCovariance(vec4 rotation, vec3 scale, out vec3 covA, out vec3 covB) {
	mat3 rot = quatToMat3(rotation);
	mat3 M = transpose(mat3(
		scale.x * rot[0],
		scale.y * rot[1],
		scale.z * rot[2]
	));
	covA = vec3(dot(M[0], M[0]), dot(M[0], M[1]), dot(M[0], M[2]));
	covB = vec3(dot(M[1], M[1]), dot(M[1], M[2]), dot(M[2], M[2]));
}
bool initCornerCov(SplatSource source, SplatCenter center, out SplatCorner corner, vec3 covA, vec3 covB) {
	mat3 Vrk = mat3(
		covA.x, covA.y, covA.z, 
		covA.y, covB.x, covB.y,
		covA.z, covB.y, covB.z
	);
	float focal = viewport_size.x * center.projMat00;
	vec3 v = center.view.xyz;
	#ifdef GSPLAT_FISHEYE
		float r_sq = max(center.fisheyeRxy * center.fisheyeRxy, 1e-8);
		float d2 = dot(v, v);
		float neg_z = -v.z;
		float g_prime = 1.0 / (center.fisheyeCosTK * center.fisheyeCosTK);
		float g_theta = fisheye_k * center.fisheyeSinTK / center.fisheyeCosTK;
		float sv = (center.fisheyeRxy > 1e-4) ? g_theta / center.fisheyeRxy : (neg_z > 0.0 ? 1.0 / neg_z : 0.0);
		float K = (center.fisheyeRxy > 1e-4) ? (g_prime * neg_z / d2 - sv) / r_sq : 0.0;
		mat3 J = mat3(
			focal * (sv + K * v.x * v.x),  focal * K * v.x * v.y,		 focal * g_prime * v.x / d2,
			focal * K * v.x * v.y,		focal * (sv + K * v.y * v.y),	focal * g_prime * v.y / d2,
			0.0,						   0.0,							0.0
		);
	#else
		vec3 vp = camera_params.w == 1.0 ? vec3(0.0, 0.0, 1.0) : v;
		float J1 = focal / vp.z;
		vec2 J2 = -J1 / vp.z * vp.xy;
		mat3 J = mat3(
			J1, 0.0, J2.x,
			0.0, J1, J2.y,
			0.0, 0.0, 0.0
		);
	#endif
	mat3 W = transpose(mat3(center.modelView));
	mat3 T = W * J;
	mat3 cov = transpose(T) * Vrk * T;
	#if GSPLAT_AA
		float detOrig = cov[0][0] * cov[1][1] - cov[0][1] * cov[0][1];
		float detBlur = (cov[0][0] + 0.3) * (cov[1][1] + 0.3) - cov[0][1] * cov[0][1];
		corner.aaFactor = sqrt(max(detOrig / detBlur, 0.0));
	#endif
	float diagonal1 = cov[0][0] + 0.3;
	float offDiagonal = cov[0][1];
	float diagonal2 = cov[1][1] + 0.3;
	float mid = 0.5 * (diagonal1 + diagonal2);
	float radius = length(vec2((diagonal1 - diagonal2) / 2.0, offDiagonal));
	float lambda1 = mid + radius;
	float lambda2 = max(mid - radius, 0.1);
	float vmin = min(1024.0, min(viewport_size.x, viewport_size.y));
	float l1 = 2.0 * min(sqrt(2.0 * lambda1), vmin);
	float l2 = 2.0 * min(sqrt(2.0 * lambda2), vmin);
	if (max(l1, l2) < minPixelSize) {
		return false;
	}
	vec2 c = center.proj.ww * viewport_size.zw;
	if (any(greaterThan(abs(center.proj.xy) - vec2(max(l1, l2)) * c, center.proj.ww))) {
		return false;
	}
	vec2 diagonalVector = normalize(vec2(offDiagonal, lambda1 - diagonal1));
	vec2 v1 = l1 * diagonalVector;
	vec2 v2 = l2 * vec2(diagonalVector.y, -diagonalVector.x);
	corner.offset = vec3((source.cornerUV.x * v1 + source.cornerUV.y * v2) * c, 0.0);
	corner.uv = source.cornerUV;
	return true;
}
#if GSPLAT_2DGS
void initCorner2DGS(SplatSource source, vec4 rotation, vec3 scale, out SplatCorner corner) {
	vec2 localPos = source.cornerUV * vec2(scale.x, scale.y) * 3.0;
	vec3 v = vec3(localPos, 0.0);
	vec3 t = 2.0 * cross(rotation.xyz, v);
	corner.offset = v + rotation.w * t + cross(rotation.xyz, t);
	corner.uv = source.cornerUV;
}
#endif
bool initCorner(SplatSource source, SplatCenter center, out SplatCorner corner) {
	vec4 rotation = getRotation().yzwx;
	vec3 scale = getScale();
	modifySplatRotationScale(center.modelCenterOriginal, center.modelCenterModified, rotation, scale);
	#if GSPLAT_2DGS
		initCorner2DGS(source, rotation, scale, corner);
		return true;
	#else
		vec3 covA, covB;
		computeCovariance(rotation.wxyz, scale, covA, covB);
		return initCornerCov(source, center, corner, covA, covB);
	#endif
}
`;
export {
	gsplatCorner_default as default
};
