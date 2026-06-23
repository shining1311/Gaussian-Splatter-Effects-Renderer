export class LightCamera {
    static pointLightRotations: Quat[];
    static create(device: any, name: any, lightType: any, face: any): Camera;
    static _spotCookieCamera: any;
    static evalSpotCookieMatrix(light: any): any;
}
import { Quat } from '../../core/math/quat.js';
import { Camera } from '../camera.js';
