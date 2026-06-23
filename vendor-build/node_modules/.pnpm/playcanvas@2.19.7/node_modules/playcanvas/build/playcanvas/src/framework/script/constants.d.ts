export const SCRIPT_INITIALIZE: "initialize";
export const SCRIPT_POST_INITIALIZE: "postInitialize";
export const SCRIPT_UPDATE: "update";
export const SCRIPT_POST_UPDATE: "postUpdate";
export const SCRIPT_SWAP: "swap";
/**
 * Script names that cannot be used, as they would clash with members of {@link ScriptComponent}
 * (a script is attached to its component as `component[scriptName]`) or {@link EventHandler}.
 *
 * @type {Set<string>}
 * @ignore
 */
export const reservedScriptNames: Set<string>;
