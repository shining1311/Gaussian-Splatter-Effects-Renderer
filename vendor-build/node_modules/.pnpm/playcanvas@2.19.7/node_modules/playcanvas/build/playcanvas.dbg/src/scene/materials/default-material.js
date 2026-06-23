import { Debug } from "../../core/debug.js";
import { DeviceCache } from "../../platform/graphics/device-cache.js";
const defaultMaterialDeviceCache = new DeviceCache();
function getDefaultMaterial(device) {
  const material = defaultMaterialDeviceCache.get(device);
  Debug.assert(material);
  return material;
}
function setDefaultMaterial(device, material) {
  Debug.assert(material);
  defaultMaterialDeviceCache.get(device, () => {
    return material;
  });
}
export {
  getDefaultMaterial,
  setDefaultMaterial
};
