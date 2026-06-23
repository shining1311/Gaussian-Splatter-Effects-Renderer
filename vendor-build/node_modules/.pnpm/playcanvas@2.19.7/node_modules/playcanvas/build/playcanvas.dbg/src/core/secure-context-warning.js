import { Debug } from "./debug.js";
const warnInsecureContext = (feature) => {
  if (typeof window === "undefined") return;
  if (window.isSecureContext !== false) return;
  Debug.warnOnce(
    `${feature} requires a secure context (HTTPS or localhost). The page is served over an insecure origin; ${feature} will be unavailable.`
  );
};
export {
  warnInsecureContext
};
