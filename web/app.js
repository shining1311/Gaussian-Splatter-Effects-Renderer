"use strict";

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const secondsLabel = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
const deg = r => r * 180 / Math.PI;
const rad = d => d * Math.PI / 180;
const mix = (a, b, t) => a + (b - a) * t;

const RENDER_PROFILES = {
    quality: { label: "高质量", pixelRatio: 2, highQualitySH: true },
    balanced: { label: "平衡", pixelRatio: 1.5, highQualitySH: true },
    preview: { label: "流畅预览", pixelRatio: 1, highQualitySH: false }
};

function rotateAroundAxis(v, axis, angle) {
    const c = Math.cos(angle), s = Math.sin(angle), dot = v.x * axis.x + v.y * axis.y + v.z * axis.z;
    return new pc.Vec3(
        v.x * c + (axis.y * v.z - axis.z * v.y) * s + axis.x * dot * (1 - c),
        v.y * c + (axis.z * v.x - axis.x * v.z) * s + axis.y * dot * (1 - c),
        v.z * c + (axis.x * v.y - axis.y * v.x) * s + axis.z * dot * (1 - c)
    );
}

const effectGLSL = `
uniform float uEffectProgress;
uniform float uEffectMode;
uniform float uEffectStrength;
uniform float uEffectWave;
uniform vec3 uEffectCenter;
uniform float uEffectRadius;
uniform vec3 uEffectTint;
uniform float uSplatScale;

float gSettle;
float gWave;
float gSeed;
float gDist;

float effectHash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec3 effectJitter(float seed) {
    return normalize(vec3(
        sin(seed * 91.73 + 0.7),
        sin(seed * 151.17 + 2.1),
        cos(seed * 73.11 + 1.3)
    ) + vec3(0.00001));
}

void effectState(vec3 center) {
    gSeed = effectHash(center);
    gDist = clamp(length(center - uEffectCenter) / max(uEffectRadius, 0.0001), 0.0, 1.6);
    float delay;
    if (uEffectMode < 0.5) {
        delay = clamp(0.02 + gDist * 0.46 + gSeed * 0.18, 0.0, 0.78);
    } else if (uEffectMode < 1.5) {
        delay = clamp(gDist * 0.70 + gSeed * 0.07, 0.0, 0.80);
    } else if (uEffectMode < 2.5) {
        float height = clamp((center.y - (uEffectCenter.y - uEffectRadius)) / max(2.0 * uEffectRadius, 0.0001), 0.0, 1.0);
        delay = clamp((1.0 - height) * 0.58 + gSeed * 0.20, 0.0, 0.80);
    } else if (uEffectMode < 3.5) {
        delay = clamp(gDist * 0.34 + gSeed * 0.30, 0.0, 0.78);
    } else if (uEffectMode < 4.5) {
        float height = clamp((center.y - (uEffectCenter.y - uEffectRadius)) / max(2.0 * uEffectRadius, 0.0001), 0.0, 1.0);
        delay = clamp((1.0 - height) * 0.54 + gSeed * 0.23, 0.0, 0.78);
    } else {
        delay = clamp(gDist * 0.20 + gSeed * 0.52, 0.0, 0.78);
    }
    gSettle = smoothstep(delay, delay + 0.22, uEffectProgress);
    gWave = exp(-pow((uEffectProgress - delay) / max(uEffectWave, 0.005), 2.0));
    if (uEffectMode > 5.5) {
        float pulseAt = 0.10 + gDist * 0.68;
        gSettle = 1.0;
        gWave = exp(-pow((uEffectProgress - pulseAt) / max(uEffectWave * 1.6, 0.01), 2.0));
    }
    if (uEffectProgress >= 0.9995) { gSettle = 1.0; gWave = 0.0; }
}

void modifySplatCenter(inout vec3 center) {
    effectState(center);
    if (uEffectProgress >= 0.9995) return;
    vec3 original = center;
    vec3 rel = original - uEffectCenter;
    vec3 jitter = effectJitter(gSeed);
    float loose = 1.0 - gSettle;

    if (uEffectMode < 0.5) {
        vec3 radial = normalize(rel + jitter * uEffectRadius * 0.08 + vec3(0.00001));
        vec3 scattered = original
            + radial * uEffectRadius * uEffectStrength * (0.12 + gSeed * 0.42)
            + jitter * uEffectRadius * uEffectStrength * 0.28
            + vec3(0.0, uEffectRadius * uEffectStrength * (0.30 + gSeed * 0.66), 0.0);
        center = mix(scattered, original, gSettle);
    } else if (uEffectMode < 1.5) {
        center += normalize(rel + vec3(0.00001)) * gWave * uEffectRadius * uEffectStrength * 0.055;
    } else if (uEffectMode < 2.5) {
        vec3 source = original + vec3(jitter.x * uEffectRadius * 0.35, uEffectRadius * (0.9 + gSeed * 1.45), jitter.z * uEffectRadius * 0.35) * uEffectStrength;
        center = mix(source, original, gSettle);
        center.xz += jitter.xz * sin(uEffectProgress * 18.0 + gSeed * 20.0) * loose * uEffectRadius * 0.04;
    } else if (uEffectMode < 3.5) {
        float r = length(rel.xz);
        float a = atan(rel.z, rel.x) + loose * (7.0 + gSeed * 8.0) * uEffectStrength;
        float expanded = r + loose * uEffectRadius * (0.22 + gSeed * 0.38) * uEffectStrength;
        vec3 vortex = vec3(cos(a) * expanded, rel.y + loose * uEffectRadius * (0.55 + gSeed) * uEffectStrength, sin(a) * expanded) + uEffectCenter;
        center = mix(vortex, original, gSettle);
    } else if (uEffectMode < 4.5) {
        float cellSize = max(uEffectRadius * 0.11, 0.0001);
        vec3 cell = floor(rel / cellSize + 0.5) * cellSize;
        vec3 gridPos = uEffectCenter + cell * (1.0 + 0.55 * uEffectStrength) + jitter * cellSize * 0.30;
        center = mix(gridPos, original, gSettle);
    } else if (uEffectMode < 5.5) {
        vec3 dust = original + vec3(jitter.x * 0.65, -(0.45 + gSeed * 1.15), jitter.z * 0.65) * uEffectRadius * uEffectStrength;
        dust.xz += vec2(sin(gSeed * 31.0), cos(gSeed * 27.0)) * uEffectRadius * loose * 0.18;
        center = mix(dust, original, gSettle);
    } else {
        center += normalize(rel + jitter * 0.05 + vec3(0.00001)) * gWave * uEffectRadius * uEffectStrength * 0.045;
    }
    center.y += gWave * uEffectRadius * uEffectStrength * 0.035;
}

void modifySplatRotationScale(vec3 originalCenter, vec3 modifiedCenter, inout vec4 rotation, inout vec3 scale) {
    effectState(originalCenter);
    vec3 originalScale = scale * uSplatScale;
    if (uEffectProgress >= 0.9995) { scale = originalScale; return; }
    if (uEffectMode > 5.5) {
        scale = originalScale * (1.0 + gWave * 0.72 * uEffectStrength);
        return;
    }
    float originalSize = gsplatGetSizeFromScale(scale) * uSplatScale;
    float dotSize = min(originalSize, uEffectRadius * (0.00065 + gSeed * 0.0011));
    gsplatMakeSpherical(scale, dotSize);
    scale = mix(scale, originalScale, gSettle);
    scale *= mix(0.28, 1.0, gSettle) * (1.0 + gWave * 1.25);
}

void modifySplatColor(vec3 center, inout vec4 color) {
    if (uEffectProgress >= 0.9995) return;
    if (uEffectMode > 5.5) {
        color.rgb += uEffectTint * gWave * 0.62 * uEffectStrength;
        return;
    }
    float restore = smoothstep(0.34, 0.96, gSettle);
    color.rgb = mix(uEffectTint, color.rgb, restore) + gWave * uEffectTint * 0.50;
    color.a *= mix(0.08, 1.0, gSettle);
}
`;

const EFFECT_TINTS = [
    [0.12, 0.74, 1.00], [0.05, 0.92, 1.00], [0.25, 0.62, 1.00],
    [0.72, 0.22, 1.00], [0.10, 0.95, 0.78], [1.00, 0.45, 0.12], [0.08, 0.72, 1.00]
];

class Studio {
    constructor() {
        this.canvas = $("stage");
        this.app = null;
        this.device = null;
        this.camera = null;
        this.splatEntity = null;
        this.asset = null;
        this.objectUrl = null;
        this.material = null;
        this.count = 0;
        this.shBands = 0;
        this.modelCenter = new pc.Vec3();
        this.targetOffset = new pc.Vec3();
        this.radius = 1;
        this.distance = 3;
        this.defaultDistance = 3;
        this.yaw = 0.55;
        this.pitch = 0.16;
        this.orbitOffset = null;
        this.orbitUp = new pc.Vec3(0, 1, 0);
        this.shotBase = null;
        this.playing = false;
        this.recording = false;
        this.scrubbing = false;
        this.progress = 0;
        this.startTime = 0;
        this.pointerId = null;
        this.dragMode = null;
        this.fpsFrames = 0;
        this.fpsClock = performance.now();
        this.lastFps = 0;
        this.appliedRenderProfile = "quality";
        this.renderConfigDirty = true;
        this.renderWindow = null;
        this.renderVideoUrl = null;
        this.bindUI();
        this.detectRecorder();
    }

    async initialize() {
        this.device = await pc.createGraphicsDevice(this.canvas, {
            deviceTypes: [pc.DEVICETYPE_WEBGL2], antialias: false, powerPreference: "high-performance"
        });
        this.device.maxPixelRatio = Math.min(devicePixelRatio || 1, 2);
        const options = new pc.AppOptions();
        options.graphicsDevice = this.device;
        options.componentSystems = [pc.RenderComponentSystem, pc.CameraComponentSystem, pc.GSplatComponentSystem];
        options.resourceHandlers = [pc.GSplatHandler];
        this.app = new pc.AppBase(this.canvas);
        this.app.init(options);
        this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.app.scene.gsplat.renderer = pc.GSPLAT_RENDERER_AUTO;
        this.app.scene.toneMapping = pc.TONEMAP_LINEAR;

        this.camera = new pc.Entity("Camera");
        this.camera.addComponent("camera", { fov: 50, clearColor: new pc.Color(0.003, 0.005, 0.008), nearClip: 0.001, farClip: 100000 });
        this.app.root.addChild(this.camera);
        this.app.on("update", dt => this.update(dt));
        this.app.start();
        this.rebuildOrbitFrame();
        this.updateCamera();
        this.applyRenderSettings(false);
        $("stats").textContent = "WebGL2 · 完整 3DGS";
    }

    bindUI() {
        const input = $("fileInput"), drop = $("dropZone");
        $("openFile").onclick = () => input.click();
        drop.onclick = () => input.click();
        input.onchange = () => input.files[0] && this.loadFile(input.files[0]);
        ["dragenter", "dragover"].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.add("drag"); }));
        ["dragleave", "drop"].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.remove("drag"); }));
        drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) this.loadFile(f); });
        window.addEventListener("dragover", e => e.preventDefault());
        window.addEventListener("drop", e => e.preventDefault());

        $("play").onclick = () => this.togglePlay();
        $("restart").onclick = () => this.restart();
        $("record").onclick = () => this.recording ? this.stopRecording() : this.startRecording();
        $("resetView").onclick = () => this.resetView();
        $("timeline").oninput = e => {
            if (!this.scrubbing) { this.pauseAtCurrentCamera(); this.captureShotBase(); this.scrubbing = true; }
            this.progress = +e.target.value;
            this.updateEffectUniforms();
            this.updateCamera(true);
        };
        $("timeline").onchange = () => { this.scrubbing = false; this.syncPlayButton(); };
        $("effectPreset").onchange = () => {
            this.markRenderDirty();
            if (this.count && this.progress >= 0.999) this.setPreviewProgress(0.35);
            this.updateEffectUniforms();
        };
        [["duration", "durationOut", v => `${(+v).toFixed(1)} 秒`],
         ["effectStrength", "effectStrengthOut", v => (+v).toFixed(2)],
         ["wave", "waveOut", v => (+v).toFixed(3)],
         ["splatSize", "sizeOut", v => (+v).toFixed(2)],
         ["cameraStrength", "cameraStrengthOut", v => (+v).toFixed(2)]].forEach(([a, b, f]) => {
            $(a).addEventListener("input", () => { $(b).value = f($(a).value); this.updateEffectUniforms(); if (a === "cameraStrength") { this.markRenderDirty(); this.updateCamera(this.scrubbing); } });
        });
        $("duration").addEventListener("input", () => this.updateLabels());
        ["duration", "effectStrength", "wave", "splatSize", "resolution", "fps", "bitrate"].forEach(id => {
            $(id).addEventListener(id === "resolution" || id === "fps" || id === "bitrate" ? "change" : "input", () => this.markRenderDirty());
        });
        $("renderQuality").addEventListener("change", () => this.markRenderDirty());
        $("applyRenderSettings").onclick = () => this.applyRenderSettings(true);
        $("showTrajectory").addEventListener("change", () => this.toast($("showTrajectory").checked ? "已显示运镜轨迹" : "已隐藏运镜轨迹"));
        $("autoCamera").addEventListener("change", () => { this.markRenderDirty(); this.updateCamera(this.scrubbing); });
        this.bindTrajectoryControls();

        this.canvas.addEventListener("contextmenu", e => e.preventDefault());
        this.canvas.addEventListener("pointerdown", e => this.beginPointer(e));
        this.canvas.addEventListener("pointermove", e => this.movePointer(e));
        this.canvas.addEventListener("pointerup", e => this.endPointer(e));
        this.canvas.addEventListener("pointercancel", e => this.endPointer(e));
        this.canvas.addEventListener("lostpointercapture", () => this.clearPointer());
        this.canvas.addEventListener("dblclick", e => { e.preventDefault(); this.resetView(); });
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            this.pauseAtCurrentCamera();
            this.distance = clamp(this.distance * Math.exp(e.deltaY * 0.001), this.radius * 0.22, this.radius * 45);
            if (this.orbitOffset) this.orbitOffset.normalize().mulScalar(this.distance);
            else this.rebuildOrbitFrame();
            this.markRenderDirty();
            this.syncCameraControls();
            this.updateCamera();
        }, { passive: false });
        window.addEventListener("blur", () => this.clearPointer());
        window.addEventListener("resize", () => this.app?.resizeCanvas());
        this.updateLabels();
    }

    bindCameraControls() {
        const refreshShot = () => { this.markRenderDirty(); this.captureShotBase(); if (this.scrubbing) this.updateCamera(true); };
        $("orbitAxis").onchange = () => { this.updateAxisControlState(); refreshShot(); };
        $("orbitDirection").onchange = refreshShot;
        $("cameraPreset").onchange = () => {
            const preset = $("cameraPreset").value, current = +$("endDistance").value;
            if (preset === "dollyOut" && current <= 1) $("endDistance").value = 1.6;
            if ((preset === "dollyIn" || preset === "spiral") && current >= 1) $("endDistance").value = 0.65;
            $("endDistanceOut").value = `${(+$('endDistance').value).toFixed(2)}×`;
            refreshShot();
        };

        [["orbitTurns", "orbitTurnsOut", v => `${(+v).toFixed(2)} 圈`],
         ["axisAzimuth", "axisAzimuthOut", v => `${Math.round(+v)}°`],
         ["axisElevation", "axisElevationOut", v => `${Math.round(+v)}°`],
         ["endDistance", "endDistanceOut", v => `${(+v).toFixed(2)}×`]].forEach(([id, out, label]) => {
            $(id).addEventListener("input", () => { $(out).value = label($(id).value); refreshShot(); });
        });

        const setStartView = () => {
            this.pauseAtCurrentCamera();
            this.yaw = rad(+$('startYaw').value);
            this.pitch = rad(+$('startPitch').value);
            this.rebuildOrbitFrame();
            this.markRenderDirty();
            this.syncCameraControls(false);
            this.captureShotBase();
            this.updateCamera();
        };
        $("startYaw").addEventListener("input", setStartView);
        $("startPitch").addEventListener("input", setStartView);

        const setCenter = () => {
            this.pauseAtCurrentCamera();
            this.targetOffset.set(+$('centerX').value * this.radius, +$('centerY').value * this.radius, +$('centerZ').value * this.radius);
            this.markRenderDirty();
            this.syncCameraControls(false);
            this.captureShotBase();
            this.updateCamera();
        };
        ["centerX", "centerY", "centerZ"].forEach(id => $(id).addEventListener("input", setCenter));
        $("startDistance").addEventListener("input", () => {
            this.pauseAtCurrentCamera();
            this.distance = this.defaultDistance * +$("startDistance").value;
            this.rebuildOrbitFrame();
            this.markRenderDirty();
            $("startDistanceOut").value = `${(+$('startDistance').value).toFixed(2)}×`;
            this.captureShotBase();
            this.updateCamera();
        });
        $("cameraFov").addEventListener("input", () => {
            $("cameraFovOut").value = `${Math.round(+$('cameraFov').value)}°`;
            if (this.camera) this.camera.camera.fov = +$("cameraFov").value;
            this.markRenderDirty();
        });
        this.updateAxisControlState();
        this.syncCameraControls();
    }

    updateAxisControlState() {
        const custom = $("orbitAxis").value === "custom";
        $("axisAzimuth").disabled = !custom;
        $("axisElevation").disabled = !custom;
    }

    syncLegacyCameraControls(includeInputs = true) {
        const yawDeg = Math.round(deg(this.yaw)), pitchDeg = Math.round(deg(this.pitch));
        if (includeInputs) {
            $("startYaw").value = clamp(yawDeg, -180, 180);
            $("startPitch").value = clamp(pitchDeg, -89, 89);
            const safeRadius = Math.max(this.radius, 0.0001);
            $("centerX").value = clamp(this.targetOffset.x / safeRadius, -2, 2);
            $("centerY").value = clamp(this.targetOffset.y / safeRadius, -2, 2);
            $("centerZ").value = clamp(this.targetOffset.z / safeRadius, -2, 2);
            $("startDistance").value = clamp(this.distance / Math.max(this.defaultDistance, 0.0001), 0.25, 5);
        }
        $("startYawOut").value = `${Math.round(+$('startYaw').value)}°`;
        $("startPitchOut").value = `${Math.round(+$('startPitch').value)}°`;
        $("centerXOut").value = (+$("centerX").value).toFixed(2);
        $("centerYOut").value = (+$("centerY").value).toFixed(2);
        $("centerZOut").value = (+$("centerZ").value).toFixed(2);
        $("startDistanceOut").value = `${(+$('startDistance').value).toFixed(2)}×`;
    }

    bindTrajectoryControls() {
        const refreshShot = () => {
            this.markRenderDirty();
            this.captureShotBase();
            this.syncCameraControls();
            if (this.scrubbing) this.updateCamera(true);
        };
        $("orbitAxis").onchange = () => { this.updateAxisControlState(); refreshShot(); };
        $("orbitDirection").onchange = refreshShot;
        $("cameraPreset").onchange = () => {
            const preset = $("cameraPreset").value;
            const current = +$("endDistance").value;
            if (preset === "dollyOut" && current <= 1) $("endDistance").value = 1.6;
            if ((preset === "dollyIn" || preset === "spiral") && current >= 1) $("endDistance").value = 0.65;
            refreshShot();
        };
        ["orbitTurns", "arcDegrees", "axisAzimuth", "axisElevation", "endDistance",
         "startYaw", "startPitch", "startDistance", "centerX", "centerY", "centerZ",
         "followX", "followY", "followZ", "cameraRoll", "cameraRollEnd"].forEach(id => $(id).addEventListener("input", refreshShot));
        $("lookAtMode").addEventListener("change", () => { this.updateLookAtControlState(); refreshShot(); });
        $("cameraFov").addEventListener("input", () => {
            if (this.camera) this.camera.camera.fov = +$("cameraFov").value;
            refreshShot();
        });
        this.updateAxisControlState();
        this.updateLookAtControlState();
        this.captureShotBase();
        this.syncCameraControls();
    }

    updateLookAtControlState() {
        const custom = $("lookAtMode").value === "custom";
        ["followX", "followY", "followZ"].forEach(id => $(id).disabled = !custom);
    }

    syncCameraControls() {
        $("startYawOut").value = `${Math.round(+$('startYaw').value)}°`;
        $("startPitchOut").value = `${Math.round(+$('startPitch').value)}°`;
        $("centerXOut").value = (+$("centerX").value).toFixed(2);
        $("centerYOut").value = (+$("centerY").value).toFixed(2);
        $("centerZOut").value = (+$("centerZ").value).toFixed(2);
        $("followXOut").value = (+$("followX").value).toFixed(2);
        $("followYOut").value = (+$("followY").value).toFixed(2);
        $("followZOut").value = (+$("followZ").value).toFixed(2);
        $("cameraRollOut").value = `${Math.round(+$('cameraRoll').value)}°`;
        $("cameraRollEndOut").value = `${Math.round(+$('cameraRollEnd').value)}°`;
        $("startDistanceOut").value = `${(+$('startDistance').value).toFixed(2)}×`;
        $("endDistanceOut").value = `${(+$('endDistance').value).toFixed(2)}×`;
        $("orbitTurnsOut").value = `${(+$('orbitTurns').value).toFixed(2)} 圈`;
        $("arcDegreesOut").value = `${Math.round(+$('arcDegrees').value)}°`;
        $("axisAzimuthOut").value = `${Math.round(+$('axisAzimuth').value)}°`;
        $("axisElevationOut").value = `${Math.round(+$('axisElevation').value)}°`;
        $("cameraFovOut").value = `${Math.round(+$('cameraFov').value)}°`;
    }

    rebuildOrbitFrame() {
        const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
        this.orbitOffset = new pc.Vec3(sy * cp * this.distance, sp * this.distance, cy * cp * this.distance);
        this.orbitUp.set(-sy * sp, cp, -cy * sp).normalize();
    }

    syncOrbitAngles() {
        if (!this.orbitOffset) return this.rebuildOrbitFrame();
        const distance = Math.max(this.orbitOffset.length(), 0.0001);
        this.distance = distance;
        this.yaw = wrapAngle(Math.atan2(this.orbitOffset.x, this.orbitOffset.z));
        this.pitch = Math.asin(clamp(this.orbitOffset.y / distance, -1, 1));
        const direction = this.orbitOffset.clone().mulScalar(1 / distance);
        this.orbitUp.sub(direction.clone().mulScalar(this.orbitUp.dot(direction)));
        if (this.orbitUp.lengthSq() < 0.000001) this.orbitUp.set(0, Math.abs(direction.y) < 0.99 ? 1 : 0, Math.abs(direction.y) < 0.99 ? 0 : 1);
        this.orbitUp.normalize();
    }

    beginPointer(e) {
        if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
        e.preventDefault();
        this.pauseAtCurrentCamera();
        this.pointerId = e.pointerId;
        this.dragMode = e.button === 0 ? "orbit" : "pan";
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        try { this.canvas.setPointerCapture(e.pointerId); } catch {}
        this.canvas.classList.add("dragging");
    }

    movePointer(e) {
        if (this.pointerId !== e.pointerId || !this.dragMode) return;
        const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        if (this.dragMode === "orbit") {
            if (!this.orbitOffset) this.rebuildOrbitFrame();
            const horizontalAxis = this.orbitUp.clone().normalize();
            this.orbitOffset = rotateAroundAxis(this.orbitOffset, horizontalAxis, -dx * 0.007);
            const forward = this.orbitOffset.clone().normalize().mulScalar(-1);
            const right = new pc.Vec3().cross(forward, this.orbitUp).normalize();
            this.orbitOffset = rotateAroundAxis(this.orbitOffset, right, dy * 0.007);
            this.orbitUp = rotateAroundAxis(this.orbitUp, right, dy * 0.007).normalize();
            this.syncOrbitAngles();
        } else {
            const k = this.distance * 0.00135;
            if (!this.orbitOffset) this.rebuildOrbitFrame();
            const forward = this.orbitOffset.clone().normalize().mulScalar(-1);
            const right = new pc.Vec3().cross(forward, this.orbitUp).normalize();
            this.targetOffset.add(right.mulScalar(-dx * k)).add(this.orbitUp.clone().mulScalar(dy * k));
        }
        this.updateCamera();
    }

    endPointer(e) {
        if (this.pointerId !== e.pointerId) return;
        try { if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId); } catch {}
        this.clearPointer();
    }

    clearPointer() {
        this.pointerId = null;
        this.dragMode = null;
        this.canvas.classList.remove("dragging");
    }

    detectRecorder() {
        const list = [["video/mp4;codecs=avc1.42E01E", "MP4 / H.264"], ["video/mp4", "MP4"], ["video/webm;codecs=vp9", "WebM / VP9"], ["video/webm;codecs=vp8", "WebM / VP8"]];
        this.recordMime = list.find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x[0]));
        $("formatHint").textContent = this.recordMime ? `输出格式：${this.recordMime[1]}。完整高斯实时录制。` : "当前浏览器不支持画布视频录制。";
    }

    setLoading(show, title = "", text = "") { $("loading").classList.toggle("hidden", !show); if (title) $("loadingTitle").textContent = title; if (text) $("loadingText").textContent = text; }
    setProgress(p, text) { $("progressBar").style.width = `${clamp(p, 0, 1) * 100}%`; $("loadingText").textContent = text || `${Math.round(p * 100)}%`; }
    toast(text) { const t = $("toast"); t.textContent = text; t.classList.add("show"); clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => t.classList.remove("show"), 3000); }

    async loadFile(file) {
        if (!this.app) return this.toast("GPU 渲染器仍在初始化");
        this.playing = false;
        this.progress = 0;
        this.setLoading(true, "正在构建完整高斯模型", "读取 PLY…");
        this.setProgress(0);
        try {
            this.removeModel();
            this.objectUrl = URL.createObjectURL(file);
            const asset = new pc.Asset(file.name, "gsplat", { url: this.objectUrl, filename: file.name, size: file.size }, { reorder: true, decompress: true });
            this.asset = asset;
            this.app.assets.add(asset);
            asset.on("progress", (received, total) => this.setProgress(total ? received / total : 0, `读取 ${(received / 1048576).toFixed(0)} / ${(file.size / 1048576).toFixed(0)} MB`));
            await new Promise((resolve, reject) => { asset.once("load", resolve); asset.once("error", reject); this.app.assets.load(asset); });
            const resource = asset.resource, box = resource.aabb;
            this.count = resource.numSplats;
            this.shBands = resource.shBands || 0;
            this.modelCenter.copy(box.center);
            this.radius = Math.max(box.halfExtents.length(), 0.001);
            this.defaultDistance = this.radius / Math.tan(25 * Math.PI / 180) * 1.18;
            this.resetView(false);
            this.splatEntity = new pc.Entity("GaussianModel");
            const profile = RENDER_PROFILES[this.appliedRenderProfile] || RENDER_PROFILES.quality;
            this.splatEntity.addComponent("gsplat", { asset, unified: false, highQualitySH: profile.highQualitySH });
            this.app.root.addChild(this.splatEntity);
            this.applyEffectShader();
            $("modelName").textContent = file.name;
            $("status").textContent = `${this.count.toLocaleString()} 高斯 · SH${this.shBands}`;
            $("stats").textContent = `WebGL2 · ${this.rendererName()} · ${(file.size / 1048576).toFixed(1)} MB`;
            ["play", "record", "restart", "timeline"].forEach(id => $(id).disabled = false);
            this.setLoading(false);
            this.progress = 1;
            this.updateEffectUniforms();
            this.updateCamera();
            $("timeline").value = 1;
            this.syncPlayButton();
            this.toast(`完整模型已载入 · ${this.shBands === 3 ? "SH3 三阶球谐" : "SH0 基础颜色"}`);
        } catch (err) {
            console.error(err);
            this.setLoading(false);
            this.toast(`导入失败：${err?.message || err}`);
        }
    }

    rendererName() {
        const profile = RENDER_PROFILES[this.appliedRenderProfile] || RENDER_PROFILES.quality;
        return `${profile.label} · ${this.splatEntity && !this.splatEntity.gsplat.unified ? "精确深度排序" : "统一渲染"}`;
    }
    removeModel() {
        if (this.splatEntity) { this.splatEntity.destroy(); this.splatEntity = null; }
        if (this.asset) { this.app.assets.remove(this.asset); this.asset.unload(); this.asset = null; }
        if (this.objectUrl) { URL.revokeObjectURL(this.objectUrl); this.objectUrl = null; }
        this.material = null;
    }

    applyEffectShader() {
        this.material = this.splatEntity.gsplat.material;
        this.material.getShaderChunks("glsl").set("gsplatModifyVS", effectGLSL);
        this.material.update();
        this.updateEffectUniforms();
    }

    updateEffectUniforms() {
        if (!this.material) return;
        const mode = +$("effectPreset").value;
        this.material.setParameter("uEffectProgress", this.progress);
        this.material.setParameter("uEffectMode", mode);
        this.material.setParameter("uEffectStrength", +$("effectStrength").value);
        this.material.setParameter("uEffectWave", +$("wave").value);
        this.material.setParameter("uEffectCenter", [this.modelCenter.x, this.modelCenter.y, this.modelCenter.z]);
        this.material.setParameter("uEffectRadius", this.radius);
        this.material.setParameter("uEffectTint", EFFECT_TINTS[mode] || EFFECT_TINTS[0]);
        this.material.setParameter("uSplatScale", +$("splatSize").value);
    }

    setPreviewProgress(progress) {
        this.progress = clamp(progress, 0, 1);
        $("timeline").value = this.progress;
        $("timeLabel").textContent = secondsLabel(this.progress * this.duration);
        this.updateEffectUniforms();
        this.updateCamera(true);
    }

    markRenderDirty() {
        this.renderConfigDirty = true;
        const state = $("renderState");
        if (state) {
            state.textContent = "设置已修改，尚未应用";
            state.className = "render-state pending";
        }
    }

    applyRenderSettings(showToast = true) {
        const profileName = $("renderQuality").value;
        const profile = RENDER_PROFILES[profileName] || RENDER_PROFILES.quality;
        this.appliedRenderProfile = profileName;
        if (this.device) this.device.maxPixelRatio = Math.min(devicePixelRatio || 1, profile.pixelRatio);
        if (this.splatEntity) this.splatEntity.gsplat.highQualitySH = profile.highQualitySH;
        if (this.camera) this.camera.camera.fov = +$("cameraFov").value;
        this.updateEffectUniforms();
        if (this.count && this.progress >= 0.999) this.setPreviewProgress(0.35);
        this.captureShotBase();
        this.updateCamera(this.scrubbing);
        this.app?.resizeCanvas();
        this.renderConfigDirty = false;
        const output = `${$("resolution").value} / ${$("fps").value} FPS / ${Math.round(+$("bitrate").value / 1000000)} Mbps`;
        const state = $("renderState");
        state.textContent = `已应用：${profile.label} · ${output}`;
        state.className = "render-state applied";
        if (showToast) this.toast(`渲染设置已应用：${profile.label}`);
    }

    poseWorldPosition(pose) {
        const centerOffset = pose.positionCenterOffset || pose.targetOffset || this.targetOffset;
        const center = new pc.Vec3(this.modelCenter.x + centerOffset.x, this.modelCenter.y + centerOffset.y, this.modelCenter.z + centerOffset.z);
        if (pose.positionOffset) return center.add(pose.positionOffset);
        const cp = Math.cos(pose.pitch);
        return center.add(new pc.Vec3(Math.sin(pose.yaw) * cp * pose.distance, Math.sin(pose.pitch) * pose.distance, Math.cos(pose.yaw) * cp * pose.distance));
    }

    drawTrajectoryMarker(position, color, size) {
        this.app.drawLine(position.clone().add(new pc.Vec3(-size, 0, 0)), position.clone().add(new pc.Vec3(size, 0, 0)), color, false);
        this.app.drawLine(position.clone().add(new pc.Vec3(0, -size, 0)), position.clone().add(new pc.Vec3(0, size, 0)), color, false);
        this.app.drawLine(position.clone().add(new pc.Vec3(0, 0, -size)), position.clone().add(new pc.Vec3(0, 0, size)), color, false);
    }

    drawTrajectory() {
        if (!this.count || this.recording || !$("showTrajectory").checked) return;
        if (!this.shotBase) this.captureShotBase();
        const pathColor = new pc.Color(0.25, 0.82, 1, 1);
        const startColor = new pc.Color(0.2, 1, 0.55, 1);
        const endColor = new pc.Color(1, 0.35, 0.45, 1);
        const currentColor = new pc.Color(1, 0.85, 0.2, 1);
        const centerColor = new pc.Color(1, 0.3, 0.95, 1);
        const followColor = new pc.Color(0.25, 1, 0.95, 1);
        const samples = 96;
        let previous = this.poseWorldPosition(this.cameraPose(0));
        const start = previous.clone();
        let end = previous;
        for (let i = 1; i <= samples; i++) {
            const current = this.poseWorldPosition(this.cameraPose(i / samples));
            this.app.drawLine(previous, current, pathColor, false);
            previous = current;
            end = current;
        }
        const markerSize = Math.max(this.radius * 0.035, 0.002);
        this.drawTrajectoryMarker(start, startColor, markerSize);
        this.drawTrajectoryMarker(end, endColor, markerSize);
        this.drawTrajectoryMarker(this.poseWorldPosition(this.cameraPose(this.progress)), currentColor, markerSize * 0.8);
        const center = this.modelCenter.clone().add(this.shotBase.positionCenterOffset);
        const follow = this.modelCenter.clone().add(this.shotBase.targetOffset);
        this.drawTrajectoryMarker(center, centerColor, markerSize * 0.85);
        this.drawTrajectoryMarker(follow, followColor, markerSize * 0.7);
        this.app.drawLine(center, follow, followColor, false);
    }

    captureShotBase() {
        const yaw = rad(+$('startYaw').value);
        const pitch = rad(+$('startPitch').value);
        const distance = this.defaultDistance * +$("startDistance").value;
        const cp = Math.cos(pitch);
        const positionCenterOffset = new pc.Vec3(+$('centerX').value * this.radius, +$('centerY').value * this.radius, +$('centerZ').value * this.radius);
        let targetOffset;
        switch ($("lookAtMode").value) {
            case "center": targetOffset = positionCenterOffset.clone(); break;
            case "model": targetOffset = new pc.Vec3(); break;
            default: targetOffset = new pc.Vec3(+$('followX').value * this.radius, +$('followY').value * this.radius, +$('followZ').value * this.radius); break;
        }
        this.shotBase = {
            yaw,
            pitch,
            distance,
            roll: rad(+$('cameraRoll').value),
            rollEnd: rad(+$('cameraRollEnd').value),
            positionOffset: new pc.Vec3(Math.sin(yaw) * cp * distance, Math.sin(pitch) * distance, Math.cos(yaw) * cp * distance),
            positionCenterOffset,
            targetOffset
        };
    }

    orbitAxisVector() {
        switch ($("orbitAxis").value) {
            case "x": return new pc.Vec3(1, 0, 0);
            case "z": return new pc.Vec3(0, 0, 1);
            case "custom": {
                const azimuth = rad(+$('axisAzimuth').value), elevation = rad(+$('axisElevation').value), ce = Math.cos(elevation);
                return new pc.Vec3(Math.cos(azimuth) * ce, Math.sin(elevation), Math.sin(azimuth) * ce).normalize();
            }
            default: return new pc.Vec3(0, 1, 0);
        }
    }

    cameraPose(progress) {
        if (!this.shotBase) this.captureShotBase();
        const b = this.shotBase;
        const t = smooth(0, 1, progress), s = +$("cameraStrength").value, preset = $("cameraPreset").value;
        const roll = mix(b.roll || 0, b.rollEnd || 0, t);
        let yaw = b.yaw, pitch = b.pitch, distance = b.distance;
        if (preset === "orbit" || preset === "spiral" || preset === "arc") {
            const cp = Math.cos(b.pitch);
            const startOffset = b.positionOffset ? b.positionOffset.clone() : new pc.Vec3(Math.sin(b.yaw) * cp * b.distance, Math.sin(b.pitch) * b.distance, Math.cos(b.yaw) * cp * b.distance);
            const axis = this.orbitAxisVector();
            const direction = +$("orbitDirection").value;
            const turns = preset === "arc" ? +$("arcDegrees").value / 360 : +$("orbitTurns").value;
            const angle = Math.PI * 2 * turns * t * s * direction;
            const positionOffset = rotateAroundAxis(startOffset, axis, angle);
            if (preset === "spiral") positionOffset.mulScalar(mix(1, mix(1, +$("endDistance").value, s), t));
            return { yaw, pitch, distance: positionOffset.length(), positionOffset, up: axis, roll, positionCenterOffset: b.positionCenterOffset, targetOffset: b.targetOffset };
        }
        switch (preset) {
            case "dollyIn":
            case "dollyOut": distance = b.distance * mix(1, mix(1, +$("endDistance").value, s), t); break;
            case "crane": pitch += 0.58 * t * s; distance *= 1 + 0.08 * Math.sin(t * Math.PI) * s; break;
            case "figure8": yaw += Math.sin(t * Math.PI * 2) * 0.62 * s; pitch += Math.sin(t * Math.PI * 4) * 0.21 * s; distance *= 1 - 0.10 * Math.sin(t * Math.PI) * s; break;
            case "hero": pitch += 0.48 * t * s; yaw += 0.42 * t * s; distance *= Math.max(0.48, 1 - 0.28 * t * s); break;
        }
        const cp = Math.cos(pitch);
        const positionOffset = new pc.Vec3(Math.sin(yaw) * cp * distance, Math.sin(pitch) * distance, Math.cos(yaw) * cp * distance);
        return { yaw, pitch, distance, positionOffset, roll, positionCenterOffset: b.positionCenterOffset, targetOffset: b.targetOffset };
    }

    applyPose(pose) {
        if (pose.positionOffset) {
            const d = Math.max(pose.positionOffset.length(), 0.0001);
            this.orbitOffset = pose.positionOffset.clone();
            this.orbitUp = (pose.up || new pc.Vec3(0, 1, 0)).clone();
            this.yaw = wrapAngle(Math.atan2(pose.positionOffset.x, pose.positionOffset.z));
            this.pitch = Math.asin(clamp(pose.positionOffset.y / d, -1, 1));
            this.distance = d;
            this.syncOrbitAngles();
        } else {
            this.yaw = wrapAngle(pose.yaw);
            this.pitch = pose.pitch;
            this.distance = pose.distance;
            this.rebuildOrbitFrame();
        }
        this.targetOffset.copy(pose.targetOffset);
        this.syncCameraControls();
    }

    pauseAtCurrentCamera() {
        if (!this.playing) return;
        this.playing = false;
        this.syncPlayButton();
        this.updateCamera(false);
    }

    updateCamera(forceShot = false) {
        if (!this.camera) return;
        const useShot = this.recording || ($("autoCamera").checked && (this.playing || forceShot));
        if (!this.orbitOffset) this.rebuildOrbitFrame();
        const pose = useShot ? this.cameraPose(this.progress) : { yaw: this.yaw, pitch: this.pitch, distance: this.distance, positionOffset: this.orbitOffset, up: this.orbitUp, positionCenterOffset: this.targetOffset, targetOffset: this.targetOffset };
        const target = new pc.Vec3(this.modelCenter.x + pose.targetOffset.x, this.modelCenter.y + pose.targetOffset.y, this.modelCenter.z + pose.targetOffset.z);
        const positionCenterOffset = pose.positionCenterOffset || pose.targetOffset;
        const positionCenter = new pc.Vec3(this.modelCenter.x + positionCenterOffset.x, this.modelCenter.y + positionCenterOffset.y, this.modelCenter.z + positionCenterOffset.z);
        if (pose.positionOffset) {
            this.camera.setPosition(positionCenter.x + pose.positionOffset.x, positionCenter.y + pose.positionOffset.y, positionCenter.z + pose.positionOffset.z);
            const forward = target.clone().sub(this.camera.getPosition()).normalize();
            let up = (pose.up || new pc.Vec3(0, 1, 0)).clone();
            if (Math.abs(forward.dot(up)) > 0.985) up = Math.abs(forward.y) < 0.985 ? new pc.Vec3(0, 1, 0) : new pc.Vec3(1, 0, 0);
            up.sub(forward.clone().mulScalar(up.dot(forward))).normalize();
            if (pose.roll) up = rotateAroundAxis(up, forward, pose.roll).normalize();
            this.camera.lookAt(target, up);
        } else {
            const cp = Math.cos(pose.pitch);
            this.camera.setPosition(positionCenter.x + Math.sin(pose.yaw) * cp * pose.distance, positionCenter.y + Math.sin(pose.pitch) * pose.distance, positionCenter.z + Math.cos(pose.yaw) * cp * pose.distance);
            this.camera.lookAt(target);
        }
        this.camera.camera.nearClip = Math.max(this.radius * 0.0001, 0.0001);
        this.camera.camera.farClip = Math.max(this.radius * 60, 100);
    }

    resetView(showToast = true) {
        this.pauseAtCurrentCamera();
        this.yaw = 0.55;
        this.pitch = 0.16;
        this.distance = this.defaultDistance;
        this.rebuildOrbitFrame();
        this.targetOffset.set(0, 0, 0);
        this.captureShotBase();
        this.syncCameraControls();
        this.updateCamera();
        if (showToast) this.toast("视角已复位");
    }

    update() {
        const now = performance.now();
        if (this.playing) {
            this.progress = clamp((now - this.startTime) / (this.duration * 1000), 0, 1);
            if (this.progress >= 1) {
                if (this.recording) { this.playing = false; setTimeout(() => this.stopRecording(), 250); }
                else if ($("loop").checked) { this.progress = 0; this.startTime = now; }
                else { this.playing = false; this.syncPlayButton(); }
            }
            this.updateEffectUniforms();
            this.updateCamera(true);
        }
        this.drawTrajectory();
        $("timeline").value = this.progress;
        $("timeLabel").textContent = secondsLabel(this.progress * this.duration);
        this.fpsFrames++;
        if (now - this.fpsClock > 800) {
            this.lastFps = Math.round(this.fpsFrames * 1000 / (now - this.fpsClock));
            this.fpsFrames = 0;
            this.fpsClock = now;
            if (this.count) $("stats").textContent = `WebGL2 · ${this.rendererName()} · ${this.lastFps} FPS · SH${this.shBands}`;
        }
    }

    get duration() { return +$("duration").value; }
    updateLabels() { $("durationLabel").textContent = secondsLabel(this.duration); $("durationOut").value = `${this.duration.toFixed(1)} 秒`; }
    togglePlay() {
        if (!this.count) return;
        if (this.progress >= 0.999) {
            this.progress = 0;
        }
        this.playing = !this.playing;
        if (this.playing) { this.captureShotBase(); this.startTime = performance.now() - this.progress * this.duration * 1000; }
        this.syncPlayButton();
    }
    restart(play = true) {
        this.progress = 0;
        this.playing = play && !!this.count;
        this.captureShotBase();
        if (this.playing) this.startTime = performance.now();
        this.updateEffectUniforms();
        this.updateCamera(this.playing);
        this.syncPlayButton();
    }
    syncPlayButton() { $("play").textContent = this.playing ? "暂停" : "播放动画"; }

    syncPlayButton() { $("play").textContent = this.playing ? "暂停" : "播放动画"; }

    openRenderWindow(width, height) {
        this.renderWindow = window.open("", "GaussianSplatterEffectsStudioRender", "width=1100,height=760,resizable=yes");
        if (!this.renderWindow) { this.toast("预览窗口被浏览器拦截，请允许弹出窗口"); return null; }
        this.renderWindow.document.open();
        this.renderWindow.document.write(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>视频渲染预览</title><style>html,body{height:100%;margin:0;background:#080b0f;color:#eef7fb;font-family:"Microsoft YaHei UI",sans-serif}.wrap{height:100%;display:grid;place-items:center}.card{text-align:center;padding:38px}.ring{width:42px;height:42px;margin:0 auto 18px;border:4px solid #1d3039;border-top-color:#65e4ff;border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}small{color:#8b99a8}</style><body><div class="wrap"><div class="card"><div class="ring"></div><h2>正在渲染视频…</h2><small>${width}×${height}，完成后将在此窗口预览并导出</small></div></div></body></html>`);
        this.renderWindow.document.close();
        return this.renderWindow;
    }

    showRenderedVideo(blob, filename, width, height, fps) {
        if (this.renderVideoUrl) URL.revokeObjectURL(this.renderVideoUrl);
        this.renderVideoUrl = URL.createObjectURL(blob);
        const win = this.renderWindow && !this.renderWindow.closed ? this.renderWindow : window.open("", "GaussianSplatterEffectsStudioRender", "width=1100,height=760,resizable=yes");
        if (!win) return this.toast("视频已生成，但预览窗口被拦截");
        win.document.open();
        win.document.write(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>渲染完成 · ${filename}</title><style>html,body{min-height:100%;margin:0;background:#080b0f;color:#eef7fb;font-family:"Microsoft YaHei UI",sans-serif}.wrap{max-width:1100px;margin:auto;padding:24px}.head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:16px}h2{margin:0;font-size:18px}p{margin:5px 0 0;color:#8b99a8;font-size:12px}video{display:block;width:100%;max-height:70vh;background:#000;border:1px solid #26333d;border-radius:12px}.export{display:inline-flex;align-items:center;height:40px;padding:0 18px;border-radius:9px;background:linear-gradient(135deg,#198eaa,#21609b);color:white;text-decoration:none;font-size:13px;white-space:nowrap}</style><body><div class="wrap"><div class="head"><div><h2>视频渲染完成</h2><p>${width}×${height} · ${fps} FPS · ${(blob.size / 1048576).toFixed(1)} MB</p></div><a class="export" href="${this.renderVideoUrl}" download="${filename}">导出视频</a></div><video src="${this.renderVideoUrl}" controls autoplay loop></video></div></body></html>`);
        win.document.close();
        win.focus();
    }

    async startRecording() {
        if (!this.count || !this.recordMime) return this.toast("当前环境无法录制视频");
        if (this.renderConfigDirty) this.applyRenderSettings(false);
        const [w, h] = $("resolution").value.split("x").map(Number), fps = +$("fps").value, bitrate = +$("bitrate").value;
        this.captureShotBase();
        this.openRenderWindow(w, h);
        this.app.setCanvasResolution(pc.RESOLUTION_FIXED, w, h);
        const stream = this.canvas.captureStream(fps), chunks = [];
        try { this.mediaRecorder = new MediaRecorder(stream, { mimeType: this.recordMime[0], videoBitsPerSecond: bitrate }); }
        catch { this.mediaRecorder = new MediaRecorder(stream, { videoBitsPerSecond: bitrate }); }
        this.mediaRecorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
            const type = this.mediaRecorder.mimeType || this.recordMime[0], ext = type.includes("mp4") ? "mp4" : "webm", blob = new Blob(chunks, { type });
            const filename = `GaussianSplatterEffectsStudio_${$("effectPreset").value}_${$("cameraPreset").value}_${w}x${h}_${fps}fps.${ext}`;
            this.showRenderedVideo(blob, filename, w, h, fps);
            stream.getTracks().forEach(t => t.stop());
            this.recording = false;
            $("record").classList.remove("active");
            $("record").textContent = "渲染视频";
            $("record").textContent = "录制视频";
            $("record").textContent = "渲染视频";
            this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
            this.app.resizeCanvas();
            this.toast(`视频已生成 · ${(blob.size / 1048576).toFixed(1)} MB`);
        };
        this.mediaRecorder.start(500);
        this.recording = true;
        $("record").classList.add("active");
        $("record").textContent = "停止渲染";
        $("record").textContent = "停止录制";
        $("record").textContent = "停止渲染";
        this.restart(true);
        this.toast(`开始录制 ${w}×${h} / ${fps} FPS`);
    }
    stopRecording() { if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") this.mediaRecorder.stop(); }
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        window.studio = new Studio();
        await window.studio.initialize();
        const model = new URLSearchParams(location.search).get("testModel");
        if (model) {
            const response = await fetch(model);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            await window.studio.loadFile(new File([blob], model.split("/").pop() || "model.ply"));
        }
    } catch (err) {
        console.error(err);
        $("status").textContent = "启动失败";
        alert(`完整 GPU 渲染器启动失败：${err?.message || err}`);
    }
});
