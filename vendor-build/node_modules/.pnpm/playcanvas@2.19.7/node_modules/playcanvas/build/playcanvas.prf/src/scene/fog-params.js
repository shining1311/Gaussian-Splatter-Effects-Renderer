import { Color } from "../core/math/color.js";
import { FOG_NONE } from "./constants.js";
class FogParams {
	type = FOG_NONE;
	color = new Color(0, 0, 0);
	density = 0;
	start = 1;
	end = 1e3;
}
export {
	FogParams
};
