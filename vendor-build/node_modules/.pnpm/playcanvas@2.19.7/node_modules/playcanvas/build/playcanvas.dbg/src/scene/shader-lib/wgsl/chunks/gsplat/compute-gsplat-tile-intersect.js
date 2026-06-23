const computeGsplatTileIntersectSource = (
  /* wgsl */
  `

struct SplatTileEval {
    radiusFactor: f32,
    splatMin: vec2f,
    splatMax: vec2f,
}

fn computeRadiusFactor(opacity: half, alphaClip: f32) -> f32 {
    return min(8.0, 2.0 * log(f32(opacity) / alphaClip));
}

fn computeSplatTileEval(
    screen: vec2f,
    cx: f32, cy: f32, cz: f32,
    opacity: half,
    viewportWidth: f32, viewportHeight: f32,
    alphaClip: f32
) -> SplatTileEval {
    let K = cx * cz - cy * cy;
    let a = 4.0 * cz / K;
    let c = 4.0 * cx / K;
    let radiusFactor = computeRadiusFactor(opacity, alphaClip);
    let vmin = min(1024.0, min(viewportWidth, viewportHeight));
    let radius = vec2f(min(sqrt(2.0 * a), vmin), min(sqrt(2.0 * c), vmin));
    var result: SplatTileEval;
    result.radiusFactor = radiusFactor;
    result.splatMin = screen - radius;
    result.splatMax = screen + radius;
    return result;
}

// Tests if the quadratic a*t^2 + b*t + c = 0 has a root in the interval [l-d, r-d].
fn segmentIntersectsEllipse(a: f32, b: f32, c: f32, d: f32, l: f32, r: f32) -> bool {
    let delta = b * b - 4.0 * a * c;
    let t1 = (l - d) * (2.0 * a) + b;
    let t2 = (r - d) * (2.0 * a) + b;
    return delta >= 0.0 && (t1 <= 0.0 || t1 * t1 <= delta) && (t2 >= 0.0 || t2 * t2 <= delta);
}

// Tests if the Gaussian cutoff ellipse intersects a tile rectangle.
// Exact conic-edge intersection using positive-definite conic: cx*dx^2 + 2*cy*dx*dy + cz*dy^2 = w
fn tileIntersectsEllipse(
    tileMin: vec2f, tileMax: vec2f, center: vec2f,
    cx: f32, cy: f32, cz: f32,
    radiusFactor: f32
) -> bool {
    if (center.x >= tileMin.x && center.x <= tileMax.x &&
        center.y >= tileMin.y && center.y <= tileMax.y) {
        return true;
    }

    let w = radiusFactor;

    // Test closest horizontal edge
    var dx: f32;
    if (center.x * 2.0 < tileMin.x + tileMax.x) {
        dx = center.x - tileMin.x;
    } else {
        dx = center.x - tileMax.x;
    }
    if (segmentIntersectsEllipse(cz, -2.0 * cy * dx, cx * dx * dx - w, center.y, tileMin.y, tileMax.y)) {
        return true;
    }

    // Test closest vertical edge
    var dy: f32;
    if (center.y * 2.0 < tileMin.y + tileMax.y) {
        dy = center.y - tileMin.y;
    } else {
        dy = center.y - tileMax.y;
    }
    if (segmentIntersectsEllipse(cx, -2.0 * cy * dy, cz * dy * dy - w, center.x, tileMin.x, tileMax.x)) {
        return true;
    }

    return false;
}
`
);
export {
  computeGsplatTileIntersectSource
};
