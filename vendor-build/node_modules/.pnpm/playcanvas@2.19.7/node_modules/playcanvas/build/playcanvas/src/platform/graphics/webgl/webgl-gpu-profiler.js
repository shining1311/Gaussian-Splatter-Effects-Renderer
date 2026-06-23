import { GpuProfiler } from "../gpu-profiler.js";
class FrameQueriesInfo {
	renderVersion;
	queries = [];
	destroy(gl) {
		this.queries.forEach((query) => gl.deleteQuery(query));
		this.queries = null;
	}
}
class WebglGpuProfiler extends GpuProfiler {
	device;
	freeQueries = [];
	frameQueries = [];
	previousFrameQueries = [];
	timings = [];
	constructor(device) {
		super();
		this.device = device;
		this.ext = device.extDisjointTimerQuery;
	}
	destroy() {
		this.freeQueries.forEach((query) => this.device.gl.deleteQuery(query));
		this.frameQueries.forEach((query) => this.device.gl.deleteQuery(query));
		this.previousFrameQueries.forEach((frameQueriesInfo) => frameQueriesInfo.destroy(this.device.gl));
		this.freeQueries = null;
		this.frameQueries = null;
		this.previousFrameQueries = null;
	}
	loseContext() {
		super.loseContext();
		this.freeQueries = [];
		this.frameQueries = [];
		this.previousFrameQueries = [];
	}
	restoreContext() {
		this.ext = this.device.extDisjointTimerQuery;
	}
	getQuery() {
		return this.freeQueries.pop() ?? this.device.gl.createQuery();
	}
	start(name) {
		if (this.ext) {
			const slot = this.getSlot(name);
			const query = this.getQuery();
			this.frameQueries[slot] = query;
			this.device.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, query);
			return slot;
		}
		return void 0;
	}
	end(slot) {
		if (slot !== void 0) {
			this.device.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
		}
	}
	frameStart() {
		this.processEnableRequest();
		if (this._enabled) {
			this.frameGPUMarkerSlot = this.start("GpuFrame");
		}
	}
	frameEnd() {
		if (this._enabled) {
			this.end(this.frameGPUMarkerSlot);
		}
	}
	request() {
		if (this._enabled) {
			const ext = this.ext;
			const gl = this.device.gl;
			const renderVersion = this.device.renderVersion;
			const frameQueries = this.frameQueries;
			if (frameQueries.length > 0) {
				this.frameQueries = [];
				const frameQueriesInfo = new FrameQueriesInfo();
				frameQueriesInfo.queries = frameQueries;
				frameQueriesInfo.renderVersion = renderVersion;
				this.previousFrameQueries.push(frameQueriesInfo);
			}
			if (this.previousFrameQueries.length > 0) {
				const previousQueriesInfo = this.previousFrameQueries[0];
				const previousQueries = previousQueriesInfo.queries;
				const lastQuery = previousQueries[previousQueries.length - 1];
				const available = gl.getQueryParameter(lastQuery, gl.QUERY_RESULT_AVAILABLE);
				const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
				if (available && !disjoint) {
					this.previousFrameQueries.shift();
					const timings = this.timings;
					timings.length = 0;
					for (let i = 0; i < previousQueries.length; i++) {
						const query = previousQueries[i];
						const duration = gl.getQueryParameter(query, gl.QUERY_RESULT);
						timings[i] = duration * 1e-6;
						this.freeQueries.push(query);
					}
					this.report(previousQueriesInfo.renderVersion, timings);
				}
				if (disjoint) {
					this.previousFrameQueries.forEach((frameQueriesInfo) => {
						this.report(frameQueriesInfo.renderVersion, null);
						frameQueriesInfo.destroy(gl);
					});
					this.previousFrameQueries.length = 0;
				}
			}
			super.request(renderVersion);
		}
	}
}
export {
	WebglGpuProfiler
};
