declare const _default: "\nvec3 toneMap(vec3 color) {\n    float tA = 2.51;\n    float tB = 0.03;\n    float tC = 2.43;\n    float tD = 0.59;\n    float tE = 0.14;\n    vec3 x = color * getExposure();\n    return (x*(tA*x+tB))/(x*(tC*x+tD)+tE);\n}\n";
export default _default;
