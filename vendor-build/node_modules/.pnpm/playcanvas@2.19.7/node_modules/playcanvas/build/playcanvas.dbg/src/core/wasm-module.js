var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const cachedResult = (func) => {
  const uninitToken = {};
  let result = uninitToken;
  return () => {
    if (result === uninitToken) {
      result = func();
    }
    return result;
  };
};
const _Impl = class _Impl {
  // load a script
  static loadScript(url, callback) {
    const s = document.createElement("script");
    s.setAttribute("src", url);
    s.onload = () => {
      callback(null);
    };
    s.onerror = () => {
      callback(`Failed to load script='${url}'`);
    };
    document.body.appendChild(s);
  }
  // load a wasm module
  static loadWasm(moduleName, config, callback) {
    const loadUrl = _Impl.wasmSupported() && config.glueUrl && config.wasmUrl ? config.glueUrl : config.fallbackUrl;
    if (loadUrl) {
      _Impl.loadScript(loadUrl, (err) => {
        if (err) {
          callback(err, null);
        } else {
          const module = window[moduleName];
          window[moduleName] = void 0;
          module({
            locateFile: () => config.wasmUrl,
            onAbort: () => {
              callback("wasm module aborted.");
            }
          }).then((instance) => {
            callback(null, instance);
          });
        }
      });
    } else {
      callback("No supported wasm modules found.", null);
    }
  }
  // get state object for the named module
  static getModule(name) {
    if (!_Impl.modules.hasOwnProperty(name)) {
      _Impl.modules[name] = {
        config: null,
        initializing: false,
        instance: null,
        callbacks: []
      };
    }
    return _Impl.modules[name];
  }
  static initialize(moduleName, module) {
    if (module.initializing) {
      return;
    }
    const config = module.config;
    if (config.glueUrl || config.wasmUrl || config.fallbackUrl) {
      module.initializing = true;
      _Impl.loadWasm(moduleName, config, (err, instance) => {
        if (err) {
          if (config.errorHandler) {
            config.errorHandler(err);
          } else {
            console.error(`failed to initialize module=${moduleName} error=${err}`);
          }
        } else {
          module.instance = instance;
          module.callbacks.forEach((callback) => {
            callback(instance);
          });
        }
      });
    }
  }
};
__publicField(_Impl, "modules", {});
// returns true if the running host supports wasm modules (all browsers except IE)
__publicField(_Impl, "wasmSupported", cachedResult(() => {
  try {
    if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
      const module = new WebAssembly.Module(Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0));
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {
  }
  return false;
}));
let Impl = _Impl;
class WasmModule {
  /**
   * Set a wasm module's configuration.
   *
   * @param {string} moduleName - Name of the module.
   * @param {object} [config] - The configuration object.
   * @param {string} [config.glueUrl] - URL of glue script.
   * @param {string} [config.wasmUrl] - URL of the wasm script.
   * @param {string} [config.fallbackUrl] - URL of the fallback script to use when wasm modules
   * aren't supported.
   * @param {number} [config.numWorkers] - For modules running on worker threads, the number of
   * threads to use. Default value is based on module implementation.
   * @param {ModuleErrorCallback} [config.errorHandler] - Function to be called if the module fails
   * to download.
   */
  static setConfig(moduleName, config) {
    const module = Impl.getModule(moduleName);
    module.config = config;
    if (module.callbacks.length > 0) {
      Impl.initialize(moduleName, module);
    }
  }
  /**
   * Get a wasm module's configuration.
   *
   * @param {string} moduleName - Name of the module.
   * @returns {object | undefined} The previously set configuration.
   */
  static getConfig(moduleName) {
    return Impl.modules?.[moduleName]?.config;
  }
  /**
   * Get a wasm module instance. The instance will be created if necessary and returned
   * in the second parameter to callback.
   *
   * @param {string} moduleName - Name of the module.
   * @param {ModuleInstanceCallback} callback - The function called when the instance is
   * available.
   */
  static getInstance(moduleName, callback) {
    const module = Impl.getModule(moduleName);
    if (module.instance) {
      callback(module.instance);
    } else {
      module.callbacks.push(callback);
      if (module.config) {
        Impl.initialize(moduleName, module);
      }
    }
  }
}
export {
  WasmModule
};
