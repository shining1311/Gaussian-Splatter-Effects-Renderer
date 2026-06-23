var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Color } from "../core/math/color.js";
import { FOG_NONE } from "./constants.js";
class FogParams {
  constructor() {
    /**
     * The type of fog used by the scene. Can be:
     *
     * - {@link FOG_NONE}
     * - {@link FOG_LINEAR}
     * - {@link FOG_EXP}
     * - {@link FOG_EXP2}
     *
     * Defaults to {@link FOG_NONE}.
     *
     * @type {string}
     */
    __publicField(this, "type", FOG_NONE);
    /**
     * The color of the fog (if enabled), specified in sRGB color space. Defaults to black (0, 0, 0).
     */
    __publicField(this, "color", new Color(0, 0, 0));
    /**
     * The density of the fog (if enabled). This property is only valid if the fog property is set
     * to {@link FOG_EXP} or {@link FOG_EXP2}. Defaults to 0.
     */
    __publicField(this, "density", 0);
    /**
     * The distance from the viewpoint where linear fog begins. This property is only valid if the
     * fog property is set to {@link FOG_LINEAR}. Defaults to 1.
     */
    __publicField(this, "start", 1);
    /**
     * The distance from the viewpoint where linear fog reaches its maximum. This property is only
     * valid if the fog property is set to {@link FOG_LINEAR}. Defaults to 1000.
     */
    __publicField(this, "end", 1e3);
  }
}
export {
  FogParams
};
