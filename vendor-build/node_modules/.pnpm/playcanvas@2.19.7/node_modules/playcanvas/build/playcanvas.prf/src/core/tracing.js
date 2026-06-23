class Tracing {
	static _traceChannels = /* @__PURE__ */ new Set();
	static stack = false;
	static set(channel, enabled = true) {
	}
	static get(channel) {
		return Tracing._traceChannels.has(channel);
	}
}
export {
	Tracing
};
