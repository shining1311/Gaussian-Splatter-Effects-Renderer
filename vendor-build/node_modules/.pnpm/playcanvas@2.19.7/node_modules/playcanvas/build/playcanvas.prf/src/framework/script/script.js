import { EventHandler } from "../../core/event-handler.js";
import { SCRIPT_INITIALIZE, SCRIPT_POST_INITIALIZE } from "./constants.js";
class Script extends EventHandler {
	static EVENT_ENABLE = "enable";
	static EVENT_DISABLE = "disable";
	static EVENT_STATE = "state";
	static EVENT_DESTROY = "destroy";
	static EVENT_ATTR = "attr";
	static EVENT_ERROR = "error";
	app;
	entity;
	_enabled;
	_enabledOld;
	_initialized;
	_postInitialized;
	__destroyed;
	__scriptType;
	__executionOrder;
	constructor(args) {
		super();
		this.initScript(args);
	}
	set enabled(value) {
		this._enabled = !!value;
		if (this.enabled === this._enabledOld) return;
		this._enabledOld = this.enabled;
		this.fire(this.enabled ? "enable" : "disable");
		this.fire("state", this.enabled);
		if (!this._initialized && this.enabled) {
			this._initialized = true;
			this.fire("preInitialize");
			if (this.initialize) {
				this.entity.script._scriptMethod(this, SCRIPT_INITIALIZE);
			}
		}
		if (this._initialized && !this._postInitialized && this.enabled && !this.entity.script._beingEnabled) {
			this._postInitialized = true;
			if (this.postInitialize) {
				this.entity.script._scriptMethod(this, SCRIPT_POST_INITIALIZE);
			}
		}
	}
	get enabled() {
		return this._enabled && !this._destroyed && this.entity.script.enabled && this.entity.enabled;
	}
	initScript(args) {
		const script = this.constructor;
		this.app = args.app;
		this.entity = args.entity;
		this._enabled = typeof args.enabled === "boolean" ? args.enabled : true;
		this._enabledOld = this.enabled;
		this.__destroyed = false;
		this.__scriptType = script;
		this.__executionOrder = -1;
	}
	static __name = null;
	// Will be assigned when calling createScript or registerScript.
	static __getScriptName = getScriptName;
	static set scriptName(value) {
		this.__name = value;
	}
	static get scriptName() {
		return this.__name;
	}
}
const funcNameRegex = /^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s\/]*)\s*/;
const toLowerCamelCase = (str) => str ? str[0].toLowerCase() + str.substring(1) : str;
function getScriptName(constructorFn) {
	if (typeof constructorFn !== "function") return void 0;
	if (Object.prototype.hasOwnProperty.call(constructorFn, "scriptName") && constructorFn.scriptName) {
		return constructorFn.scriptName;
	}
	if ("name" in Function.prototype) return constructorFn.name;
	if (constructorFn === Function || constructorFn === Function.prototype.constructor) return "Function";
	const match = `${constructorFn}`.match(funcNameRegex);
	return match ? match[1] : void 0;
}
function getScriptRegistryName(constructorFn) {
	if (typeof constructorFn !== "function") return void 0;
	if (Object.prototype.hasOwnProperty.call(constructorFn, "__name") && constructorFn.__name) {
		return constructorFn.__name;
	}
	if (Object.prototype.hasOwnProperty.call(constructorFn, "scriptName") && constructorFn.scriptName) {
		return constructorFn.scriptName;
	}
	const name = getScriptName(constructorFn);
	return name ? toLowerCamelCase(name) : void 0;
}
export {
	Script,
	getScriptName,
	getScriptRegistryName,
	toLowerCamelCase
};
