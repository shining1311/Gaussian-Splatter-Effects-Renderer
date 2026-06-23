var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Quat } from "../../core/math/quat.js";
import { Vec3 } from "../../core/math/vec3.js";
import { Mat4 } from "../../core/math/mat4.js";
import { ASPECT_MANUAL, LIGHTTYPE_DIRECTIONAL, LIGHTTYPE_OMNI, LIGHTTYPE_SPOT, PROJECTION_ORTHOGRAPHIC, PROJECTION_PERSPECTIVE } from "../constants.js";
import { Camera } from "../camera.js";
import { GraphNode } from "../graph-node.js";
const _viewMat = new Mat4();
const _viewProjMat = new Mat4();
const _viewportMatrix = new Mat4();
const _LightCamera = class _LightCamera {
  static create(device, name, lightType, face) {
    const camera = new Camera(device);
    camera.node = new GraphNode(name);
    camera.aspectRatio = 1;
    camera.aspectRatioMode = ASPECT_MANUAL;
    camera._scissorRectClear = true;
    switch (lightType) {
      case LIGHTTYPE_OMNI:
        camera.node.setRotation(_LightCamera.pointLightRotations[face]);
        camera.fov = 90;
        camera.projection = PROJECTION_PERSPECTIVE;
        break;
      case LIGHTTYPE_SPOT:
        camera.projection = PROJECTION_PERSPECTIVE;
        break;
      case LIGHTTYPE_DIRECTIONAL:
        camera.projection = PROJECTION_ORTHOGRAPHIC;
        break;
    }
    return camera;
  }
  // temporary camera to calculate spot light cookie view-projection matrix when shadow matrix is not available
  // todo - unify the code with the shadow spot camera
  static evalSpotCookieMatrix(light) {
    let cookieCamera = _LightCamera._spotCookieCamera;
    if (!cookieCamera) {
      cookieCamera = _LightCamera.create(light.device, "SpotCookieCamera", LIGHTTYPE_SPOT);
      _LightCamera._spotCookieCamera = cookieCamera;
    }
    cookieCamera.fov = light._outerConeAngle * 2;
    const cookieNode = cookieCamera._node;
    cookieNode.setPosition(light._node.getPosition());
    cookieNode.setRotation(light._node.getRotation());
    cookieNode.rotateLocal(-90, 0, 0);
    _viewMat.setTRS(cookieNode.getPosition(), cookieNode.getRotation(), Vec3.ONE).invert();
    _viewProjMat.mul2(cookieCamera.projectionMatrix, _viewMat);
    const cookieMatrix = light.cookieMatrix;
    const rectViewport = light.atlasViewport;
    _viewportMatrix.setViewport(rectViewport.x, rectViewport.y, rectViewport.z, rectViewport.w);
    cookieMatrix.mul2(_viewportMatrix, _viewProjMat);
    return cookieMatrix;
  }
};
// camera rotation angles used when rendering cubemap faces
__publicField(_LightCamera, "pointLightRotations", [
  new Quat().setFromEulerAngles(0, 90, 180),
  new Quat().setFromEulerAngles(0, -90, 180),
  new Quat().setFromEulerAngles(90, 0, 0),
  new Quat().setFromEulerAngles(-90, 0, 0),
  new Quat().setFromEulerAngles(0, 180, 180),
  new Quat().setFromEulerAngles(0, 0, 180)
]);
__publicField(_LightCamera, "_spotCookieCamera", null);
let LightCamera = _LightCamera;
export {
  LightCamera
};
