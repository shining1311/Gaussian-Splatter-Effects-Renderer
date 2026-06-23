declare const _default: "\nfn calcDispatch2D(count: u32, maxDim: u32) -> vec2u {\n    if (count <= maxDim) {\n        return vec2u(count, 1u);\n    }\n    let y = (count + maxDim - 1u) / maxDim;\n    let x = (count + y - 1u) / y;\n    return vec2u(x, y);\n}\n";
export default _default;
