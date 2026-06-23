"use strict";

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const secondsLabel = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${(s%60).toFixed(1).padStart(4,"0")}`;

const effectGLSL = `
uniform float uEffectProgress;
uniform float uEffectStrength;
uniform float uEffectWave;
uniform vec3 uEffectCenter;
uniform float uEffectRadius;
uniform vec3 uEffectTint;
uniform float uSplatScale;

float gSettle;
float gWave;

float effectHash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

void effectState(vec3 center) {
    float seed = effectHash(center);
    float d = clamp(length(center - uEffectCenter) / max(uEffectRadius, 0.0001), 0.0, 1.5);
    float delay = clamp(0.025 + d * 0.48 + seed * 0.18, 0.0, 0.78);
    gSettle = smoothstep(delay, delay + 0.24, uEffectProgress);
    gWave = exp(-pow((uEffectProgress - delay) / max(uEffectWave, 0.005), 2.0));
}

void modifySplatCenter(inout vec3 center) {
    effectState(center);
    if (uEffectProgress >= 0.9999) return;
    vec3 original = center;
    float seed = effectHash(original);
    vec3 jitter = normalize(vec3(
        sin(seed * 91.73 + 0.7),
        sin(seed * 151.17 + 2.1),
        cos(seed * 73.11 + 1.3)
    ));
    vec3 radial = normalize(original - uEffectCenter + jitter * uEffectRadius * 0.08 + vec3(0.00001));
    vec3 exploded = original
        + radial * uEffectRadius * uEffectStrength * (0.12 + seed * 0.42)
        + jitter * uEffectRadius * uEffectStrength * 0.28
        + vec3(0.0, uEffectRadius * uEffectStrength * (0.38 + seed * 0.72), 0.0);
    center = mix(exploded, original, gSettle);
    center.y += gWave * uEffectRadius * uEffectStrength * 0.065;
}

void modifySplatRotationScale(vec3 originalCenter, vec3 modifiedCenter, inout vec4 rotation, inout vec3 scale) {
    effectState(originalCenter);
    vec3 originalScale = scale * uSplatScale;
    if (uEffectProgress >= 0.9999) { scale = originalScale; return; }
    float originalSize = gsplatGetSizeFromScale(scale);
    float seed = effectHash(originalCenter);
    float dotSize = min(originalSize, uEffectRadius * (0.00065 + seed * 0.0009));
    gsplatMakeSpherical(scale, dotSize);
    scale = mix(scale, originalScale, gSettle);
    scale *= 1.0 + gWave * 1.25;
}

void modifySplatColor(vec3 center, inout vec4 color) {
    effectState(center);
    if (uEffectProgress >= 0.9999) return;
    float restore = smoothstep(0.52, 0.98, gSettle);
    color.rgb = mix(uEffectTint, color.rgb, restore) + gWave * vec3(0.22, 0.30, 0.36);
    color.a *= mix(0.12, 1.0, gSettle);
}
`;

const effectWGSL = `
uniform uEffectProgress: f32;
uniform uEffectStrength: f32;
uniform uEffectWave: f32;
uniform uEffectCenter: vec3f;
uniform uEffectRadius: f32;
uniform uEffectTint: vec3f;
uniform uSplatScale: f32;

var<private> gSettle: f32;
var<private> gWave: f32;

fn effectHash(p: vec3f) -> f32 {
    return fract(sin(dot(p, vec3f(127.1, 311.7, 74.7))) * 43758.5453);
}

fn effectState(center: vec3f) {
    let seed = effectHash(center);
    let d = clamp(length(center - uniform.uEffectCenter) / max(uniform.uEffectRadius, 0.0001), 0.0, 1.5);
    let delay = clamp(0.025 + d * 0.48 + seed * 0.18, 0.0, 0.78);
    gSettle = smoothstep(delay, delay + 0.24, uniform.uEffectProgress);
    gWave = exp(-pow((uniform.uEffectProgress - delay) / max(uniform.uEffectWave, 0.005), 2.0));
}

fn modifySplatCenter(center: ptr<function, vec3f>) {
    effectState(*center);
    if (uniform.uEffectProgress >= 0.9999) { return; }
    let original = *center;
    let seed = effectHash(original);
    let jitter = normalize(vec3f(
        sin(seed * 91.73 + 0.7),
        sin(seed * 151.17 + 2.1),
        cos(seed * 73.11 + 1.3)
    ));
    let radial = normalize(original - uniform.uEffectCenter + jitter * uniform.uEffectRadius * 0.08 + vec3f(0.00001));
    let exploded = original
        + radial * uniform.uEffectRadius * uniform.uEffectStrength * (0.12 + seed * 0.42)
        + jitter * uniform.uEffectRadius * uniform.uEffectStrength * 0.28
        + vec3f(0.0, uniform.uEffectRadius * uniform.uEffectStrength * (0.38 + seed * 0.72), 0.0);
    *center = mix(exploded, original, gSettle);
    (*center).y += gWave * uniform.uEffectRadius * uniform.uEffectStrength * 0.065;
}

fn modifySplatRotationScale(originalCenter: vec3f, modifiedCenter: vec3f, rotation: ptr<function, vec4f>, scale: ptr<function, vec3f>) {
    effectState(originalCenter);
    let originalScale = *scale * uniform.uSplatScale;
    if (uniform.uEffectProgress >= 0.9999) { *scale = originalScale; return; }
    let originalSize = gsplatGetSizeFromScale(*scale);
    let seed = effectHash(originalCenter);
    let dotSize = min(originalSize, uniform.uEffectRadius * (0.00065 + seed * 0.0009));
    gsplatMakeSpherical(scale, dotSize);
    *scale = mix(*scale, originalScale, gSettle) * (1.0 + gWave * 1.25);
}

fn modifySplatColor(center: vec3f, color: ptr<function, vec4f>) {
    effectState(center);
    if (uniform.uEffectProgress >= 0.9999) { return; }
    let restore = smoothstep(0.52, 0.98, gSettle);
    (*color).rgb = mix(uniform.uEffectTint, (*color).rgb, restore) + gWave * vec3f(0.22, 0.30, 0.36);
    (*color).a *= mix(0.12, 1.0, gSettle);
}
`;

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
        this.radius = 1;
        this.distance = 3;
        this.yaw = 0.55;
        this.pitch = 0.16;
        this.playing = false;
        this.recording = false;
        this.progress = 0;
        this.startTime = 0;
        this.dragging = false;
        this.fpsFrames = 0;
        this.fpsClock = performance.now();
        this.lastFps = 0;
        this.bindUI();
        this.detectRecorder();
    }

    async initialize() {
        const options = {
            // The legacy GSplat path gives every model its own fully depth-sorted
            // material.  WebGL2 is currently the stable customization path for
            // the reveal shader; Edge still runs it on the high-performance GPU.
            deviceTypes: [pc.DEVICETYPE_WEBGL2],
            antialias: false,
            powerPreference: "high-performance"
        };
        this.device = await pc.createGraphicsDevice(this.canvas, options);
        this.device.maxPixelRatio = Math.min(devicePixelRatio || 1, 2);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = this.device;
        appOptions.componentSystems = [pc.RenderComponentSystem, pc.CameraComponentSystem, pc.GSplatComponentSystem];
        appOptions.resourceHandlers = [pc.GSplatHandler];
        this.app = new pc.AppBase(this.canvas);
        this.app.init(appOptions);
        this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.app.scene.gsplat.renderer = pc.GSPLAT_RENDERER_AUTO;
        this.app.scene.toneMapping = pc.TONEMAP_LINEAR;

        this.camera = new pc.Entity("Camera");
        this.camera.addComponent("camera", {fov: 50, clearColor: new pc.Color(0.003,0.005,0.008), nearClip: 0.001, farClip: 100000});
        this.app.root.addChild(this.camera);
        this.app.on("update", dt => this.update(dt));
        this.app.start();
        this.updateCamera();
        $("stats").textContent = `${this.device.isWebGPU ? "WebGPU" : "WebGL2"} · 完整3DGS`;
    }

    bindUI() {
        const input=$("fileInput"),drop=$("dropZone");
        $("openFile").onclick=()=>input.click(); drop.onclick=()=>input.click();
        input.onchange=()=>input.files[0]&&this.loadFile(input.files[0]);
        ["dragenter","dragover"].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add("drag");}));
        ["dragleave","drop"].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove("drag");}));
        drop.addEventListener("drop",e=>{const f=e.dataTransfer.files[0];if(f)this.loadFile(f);});
        window.addEventListener("dragover",e=>e.preventDefault()); window.addEventListener("drop",e=>e.preventDefault());
        $("play").onclick=()=>this.togglePlay(); $("restart").onclick=()=>this.restart();
        $("record").onclick=()=>this.recording?this.stopRecording():this.startRecording();
        $("timeline").oninput=e=>{this.playing=false;this.progress=+e.target.value;this.syncPlayButton();this.updateEffectUniforms();};
        [["duration","durationOut",v=>`${(+v).toFixed(1)} 秒`],["explosion","explosionOut",v=>(+v).toFixed(2)],["wave","waveOut",v=>(+v).toFixed(3)],["splatSize","sizeOut",v=>(+v).toFixed(2)]].forEach(([a,b,f])=>$(a).addEventListener("input",()=>{$(b).value=f($(a).value);this.updateEffectUniforms();}));
        $("duration").addEventListener("input",()=>this.updateLabels());
        this.canvas.addEventListener("pointerdown",e=>{this.dragging=true;this.lastX=e.clientX;this.lastY=e.clientY;this.canvas.setPointerCapture(e.pointerId);});
        this.canvas.addEventListener("pointermove",e=>{if(!this.dragging)return;this.yaw-=(e.clientX-this.lastX)*.006;this.pitch=clamp(this.pitch-(e.clientY-this.lastY)*.006,-1.35,1.35);this.lastX=e.clientX;this.lastY=e.clientY;this.updateCamera();});
        this.canvas.addEventListener("pointerup",()=>this.dragging=false);
        this.canvas.addEventListener("wheel",e=>{e.preventDefault();this.distance=clamp(this.distance*Math.exp(e.deltaY*.001),this.radius*.08,this.radius*20);this.updateCamera();},{passive:false});
        window.addEventListener("resize",()=>this.app?.resizeCanvas());
        this.updateLabels();
    }

    detectRecorder() {
        const list=[["video/mp4;codecs=avc1.42E01E","MP4 / H.264"],["video/mp4","MP4"],["video/webm;codecs=vp9","WebM / VP9"],["video/webm;codecs=vp8","WebM / VP8"]];
        this.recordMime=list.find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x[0]));
        $("formatHint").textContent=this.recordMime?`输出格式：${this.recordMime[1]}。完整高斯实时录制。`:"当前浏览器不支持画布视频录制。";
    }

    setLoading(show,title="",text=""){$("loading").classList.toggle("hidden",!show);if(title)$("loadingTitle").textContent=title;if(text)$("loadingText").textContent=text;}
    setProgress(p,text){$("progressBar").style.width=`${clamp(p,0,1)*100}%`;$("loadingText").textContent=text||`${Math.round(p*100)}%`;}
    toast(text){const t=$("toast");t.textContent=text;t.classList.add("show");clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>t.classList.remove("show"),3000);}

    async loadFile(file) {
        if(!this.app)return this.toast("GPU 渲染器仍在初始化");
        this.playing=false; this.progress=0; this.setLoading(true,"正在构建完整高斯模型","读取 PLY…"); this.setProgress(0);
        try {
            this.removeModel();
            this.objectUrl=URL.createObjectURL(file);
            const asset=new pc.Asset(file.name,"gsplat",{url:this.objectUrl,filename:file.name,size:file.size},{reorder:true,decompress:true});
            this.asset=asset; this.app.assets.add(asset);
            asset.on("progress",(received,total)=>this.setProgress(total?received/total:0,`读取 ${(received/1048576).toFixed(0)} / ${(file.size/1048576).toFixed(0)} MB`));
            await new Promise((resolve,reject)=>{asset.once("load",resolve);asset.once("error",reject);this.app.assets.load(asset);});
            const resource=asset.resource;
            this.count=resource.numSplats; this.shBands=resource.shBands||0;
            const box=resource.aabb;
            this.modelCenter.copy(box.center);
            this.radius=Math.max(box.halfExtents.length(),0.001);
            this.distance=this.radius/Math.tan(25*Math.PI/180)*1.18;
            this.splatEntity=new pc.Entity("GaussianModel");
            this.splatEntity.addComponent("gsplat",{asset:asset,unified:false});
            this.app.root.addChild(this.splatEntity);
            if (!new URLSearchParams(location.search).has("disableEffect")) this.applyEffectShader();
            this.updateCamera();
            $("modelName").textContent=file.name;
            $("status").textContent=`${this.count.toLocaleString()} 高斯 · SH${this.shBands}`;
            $("stats").textContent=`${this.device.isWebGPU?"WebGPU":"WebGL2"} · ${this.rendererName()} · ${(file.size/1048576).toFixed(1)} MB`;
            ["play","record","restart","timeline"].forEach(id=>$(id).disabled=false);
            // Import should open on the exact, settled model so the user can
            // inspect sharpness before starting the reveal animation.
            this.setLoading(false);
            this.progress=1;
            this.updateEffectUniforms();
            this.updateCamera();
            $("timeline").value=1;
            this.updateLabels();
            this.syncPlayButton();
            this.toast(`完整模型加载完成 · ${this.shBands===3?"三阶球谐":"基础颜色"}`);
        } catch(err) {console.error(err);this.setLoading(false);this.toast(`导入失败：${err?.message||err}`);}
    }

    rendererName(){if(this.splatEntity&&!this.splatEntity.gsplat.unified)return "CPU Depth Sort";const r=this.app.scene.gsplat.currentRenderer;return r===pc.GSPLAT_RENDERER_COMPUTE?"GPU Compute":r===pc.GSPLAT_RENDERER_RASTER_GPU_SORT?"GPU Sort":"Depth Sort";}
    removeModel(){if(this.splatEntity){this.splatEntity.destroy();this.splatEntity=null;}if(this.asset){this.app.assets.remove(this.asset);this.asset.unload();this.asset=null;}if(this.objectUrl){URL.revokeObjectURL(this.objectUrl);this.objectUrl=null;}this.material=null;}

    applyEffectShader() {
        this.material=this.splatEntity.gsplat.material;
        const language=this.device.isWebGPU?"wgsl":"glsl";
        this.material.getShaderChunks(language).set("gsplatModifyVS",this.device.isWebGPU?effectWGSL:effectGLSL);
        this.material.update();
        this.updateEffectUniforms();
    }

    updateEffectUniforms() {
        if(!this.material)return;
        this.material.setParameter("uEffectProgress",this.progress);
        this.material.setParameter("uEffectStrength",+$("explosion").value);
        this.material.setParameter("uEffectWave",+$("wave").value);
        this.material.setParameter("uEffectCenter",[this.modelCenter.x,this.modelCenter.y,this.modelCenter.z]);
        this.material.setParameter("uEffectRadius",this.radius);
        this.material.setParameter("uEffectTint",[0.12,0.74,1.0]);
        this.material.setParameter("uSplatScale",+$("splatSize").value);
    }

    updateCamera() {
        if(!this.camera)return;
        const auto=$("autoCamera").checked&&this.playing, e=smooth(0,1,this.progress);
        const yaw=this.yaw+(auto?e*.13:0),dist=this.distance*(auto?(1-e*.16):1),cp=Math.cos(this.pitch);
        this.camera.setPosition(this.modelCenter.x+Math.sin(yaw)*cp*dist,this.modelCenter.y+Math.sin(this.pitch)*dist,this.modelCenter.z+Math.cos(yaw)*cp*dist);
        this.camera.lookAt(this.modelCenter);
        this.camera.camera.nearClip=Math.max(this.radius*.0001,0.0001);
        this.camera.camera.farClip=Math.max(this.radius*30,100);
    }

    update(dt) {
        const now=performance.now();
        if(this.playing){this.progress=clamp((now-this.startTime)/(this.duration*1000),0,1);if(this.progress>=1){if(this.recording){this.playing=false;setTimeout(()=>this.stopRecording(),250);}else if($("loop").checked){this.progress=0;this.startTime=now;}else{this.playing=false;this.syncPlayButton();}}this.updateEffectUniforms();this.updateCamera();}
        $("timeline").value=this.progress;$("timeLabel").textContent=secondsLabel(this.progress*this.duration);
        this.fpsFrames++;if(now-this.fpsClock>800){this.lastFps=Math.round(this.fpsFrames*1000/(now-this.fpsClock));this.fpsFrames=0;this.fpsClock=now;if(this.count)$("stats").textContent=`${this.device.isWebGPU?"WebGPU":"WebGL2"} · ${this.rendererName()} · ${this.lastFps} FPS · SH${this.shBands}`;}
    }

    get duration(){return +$("duration").value;}
    updateLabels(){$("durationLabel").textContent=secondsLabel(this.duration);$("durationOut").value=`${this.duration.toFixed(1)} 秒`;}
    togglePlay(){if(!this.count)return;if(this.progress>=.999)this.progress=0;this.playing=!this.playing;if(this.playing)this.startTime=performance.now()-this.progress*this.duration*1000;this.syncPlayButton();}
    restart(play=true){this.progress=0;this.playing=play&&!!this.count;if(this.playing)this.startTime=performance.now();this.updateEffectUniforms();this.updateCamera();this.syncPlayButton();}
    syncPlayButton(){$("play").textContent=this.playing?"暂停":"播放动画";}

    async startRecording(){
        if(!this.count||!this.recordMime)return this.toast("当前环境无法录制视频");
        const [w,h]=$("resolution").value.split("x").map(Number),fps=+$("fps").value,bitrate=+$("bitrate").value;
        this.app.setCanvasResolution(pc.RESOLUTION_FIXED,w,h);
        const stream=this.canvas.captureStream(fps),chunks=[];
        try{this.mediaRecorder=new MediaRecorder(stream,{mimeType:this.recordMime[0],videoBitsPerSecond:bitrate});}catch{this.mediaRecorder=new MediaRecorder(stream,{videoBitsPerSecond:bitrate});}
        this.mediaRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        this.mediaRecorder.onstop=()=>{const type=this.mediaRecorder.mimeType||this.recordMime[0],ext=type.includes("mp4")?"mp4":"webm",blob=new Blob(chunks,{type}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`splat_full_${w}x${h}_${fps}fps.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),15000);stream.getTracks().forEach(t=>t.stop());this.recording=false;$("record").classList.remove("active");$("record").textContent="录制视频";this.app.setCanvasResolution(pc.RESOLUTION_AUTO);this.app.resizeCanvas();this.toast(`视频已生成 · ${(blob.size/1048576).toFixed(1)} MB`);};
        this.mediaRecorder.start(500);this.recording=true;$("record").classList.add("active");$("record").textContent="停止录制";this.restart(true);this.toast(`开始录制 ${w}×${h} / ${fps} FPS`);
    }
    stopRecording(){if(this.mediaRecorder&&this.mediaRecorder.state!=="inactive")this.mediaRecorder.stop();}
}

window.addEventListener("DOMContentLoaded",async()=>{
    try{
        window.studio=new Studio();await window.studio.initialize();
        const model=new URLSearchParams(location.search).get("testModel");
        if(model){const response=await fetch(model);if(!response.ok)throw new Error(`HTTP ${response.status}`);const blob=await response.blob();await window.studio.loadFile(new File([blob],model.split("/").pop()||"model.ply"));}
    }catch(err){console.error(err);$("status").textContent="启动失败";alert(`完整GPU渲染器启动失败：${err?.message||err}`);}
});
