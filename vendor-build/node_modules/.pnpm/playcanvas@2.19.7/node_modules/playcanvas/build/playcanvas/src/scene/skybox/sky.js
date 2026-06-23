import { Vec3 } from "../../core/math/vec3.js";
import { SKYTYPE_INFINITE } from "../constants.js";
import { FisheyeProjection } from "../graphics/fisheye-projection.js";
import { GraphNode } from "../graph-node.js";
import { SkyMesh } from "./sky-mesh.js";
class Sky {
	_type = SKYTYPE_INFINITE;
	_center = new Vec3(0, 1, 0);
	skyMesh = null;
	_depthWrite = false;
	_fisheye = 0;
	_fisheyeProj = null;
	node = new GraphNode("SkyMeshNode");
	constructor(scene) {
		this.device = scene.device;
		this.scene = scene;
		this.center = new Vec3(0, 1, 0);
		this.centerArray = new Float32Array(3);
		this.projectedSkydomeCenterId = this.device.scope.resolve("projectedSkydomeCenter");
		this._preRenderEvt = scene.on("prerender", this._onPreRender, this);
	}
	destroy() {
		this._preRenderEvt.off();
		this.resetSkyMesh();
	}
	applySettings(render) {
		this.type = render.skyType ?? SKYTYPE_INFINITE;
		this.node.setLocalPosition(new Vec3(render.skyMeshPosition ?? [0, 0, 0]));
		this.node.setLocalEulerAngles(new Vec3(render.skyMeshRotation ?? [0, 0, 0]));
		this.node.setLocalScale(new Vec3(render.skyMeshScale ?? [1, 1, 1]));
		if (render.skyCenter) {
			this._center = new Vec3(render.skyCenter);
		}
	}
	set type(value) {
		if (this._type !== value) {
			this._type = value;
			this.scene.updateShaders = true;
			this.updateSkyMesh();
		}
	}
	get type() {
		return this._type;
	}
	set center(value) {
		this._center.copy(value);
	}
	get center() {
		return this._center;
	}
	set depthWrite(value) {
		if (this._depthWrite !== value) {
			this._depthWrite = value;
			if (this.skyMesh) {
				this.skyMesh.depthWrite = value;
			}
		}
	}
	get depthWrite() {
		return this._depthWrite;
	}
	set fisheye(value) {
		if (this._fisheye !== value) {
			const wasEnabled = this._fisheye > 0;
			this._fisheye = value;
			const isEnabled = value > 0;
			if (wasEnabled !== isEnabled) {
				this._fisheyeProj ?? (this._fisheyeProj = new FisheyeProjection());
				if (this._type === SKYTYPE_INFINITE) {
					this._setFisheyeDefine(isEnabled);
				}
			}
		}
	}
	get fisheye() {
		return this._fisheye;
	}
	updateSkyMesh() {
		const texture = this.scene._getSkyboxTex();
		if (texture) {
			this.resetSkyMesh();
			this.skyMesh = new SkyMesh(this.device, this.scene, this.node, texture, this.type);
			this.skyMesh.depthWrite = this._depthWrite;
			if (this._fisheye > 0 && this.type === SKYTYPE_INFINITE) {
				this._setFisheyeDefine(true);
			}
			this.scene.fire("set:skybox", texture);
		}
	}
	resetSkyMesh() {
		this.skyMesh?.destroy();
		this.skyMesh = null;
	}
	update() {
		if (this.type !== SKYTYPE_INFINITE) {
			const { center, centerArray } = this;
			const temp = new Vec3();
			this.node.getWorldTransform().transformPoint(center, temp);
			centerArray[0] = temp.x;
			centerArray[1] = temp.y;
			centerArray[2] = temp.z;
			this.projectedSkydomeCenterId.setValue(centerArray);
		}
	}
	_setFisheyeDefine(enabled) {
		if (this.skyMesh?.meshInstance) {
			const material = this.skyMesh.meshInstance.material;
			material.setDefine("SKY_FISHEYE", enabled);
			material.update();
		}
	}
	_onPreRender(cameraComponent) {
		if (this._fisheye > 0 && this._fisheyeProj && this.skyMesh?.meshInstance) {
			const camera = cameraComponent.camera;
			const proj = this._fisheyeProj;
			proj.update(this._fisheye, camera.fov, camera.projectionMatrix);
			const material = this.skyMesh.meshInstance.material;
			material.setParameter("fisheye_k", proj.k);
			material.setParameter("fisheye_invK", proj.invK);
			material.setParameter("fisheye_projMat00", proj.projMat00);
			material.setParameter("fisheye_projMat11", proj.projMat11);
		}
	}
}
export {
	Sky
};
