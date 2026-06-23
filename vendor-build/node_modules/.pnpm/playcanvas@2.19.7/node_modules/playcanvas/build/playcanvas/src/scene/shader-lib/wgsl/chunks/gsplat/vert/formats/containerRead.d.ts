declare const _default: "\nfn getCenter() -> vec3f {\n    #include \"gsplatContainerUserReadVS\"\n    return splatCenter;\n}\n\nfn getRotation() -> vec4f {\n    return splatRotation;\n}\n\nfn getScale() -> vec3f {\n    return splatScale;\n}\n\nfn getColor() -> vec4f {\n    return splatColor;\n}\n";
export default _default;
