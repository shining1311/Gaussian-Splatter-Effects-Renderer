declare const _default: "\n// Make splat spherical by setting uniform scale\n// Use size = 0.0 to hide the splat\nvoid gsplatMakeSpherical(inout vec3 scale, float size) {\n    scale = vec3(size);\n}\n\n// Get RMS size from scale vector\nfloat gsplatGetSizeFromScale(vec3 scale) {\n    return sqrt((scale.x * scale.x + scale.y * scale.y + scale.z * scale.z) / 3.0);\n}\n";
export default _default;
