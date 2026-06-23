import { EventHandler } from "../../core/event-handler.js";
import { math } from "../../core/math/math.js";
import { Listener } from "./listener.js";
const CONTEXT_STATE_RUNNING = "running";
const USER_INPUT_EVENTS = [
	"click",
	"touchstart",
	"mousedown"
];
class SoundManager extends EventHandler {
	_context = null;
	_unlockHandlerFunc;
	_userSuspended = false;
	listener;
	_volume = 1;
	constructor() {
		super();
		this._unlockHandlerFunc = this._unlockHandler.bind(this);
		this.listener = new Listener(this);
	}
	set volume(volume) {
		volume = math.clamp(volume, 0, 1);
		this._volume = volume;
		this.fire("volumechange", volume);
	}
	get volume() {
		return this._volume;
	}
	get suspended() {
		return this._userSuspended;
	}
	get context() {
		if (!this._context) {
			const AudioContextCtor = typeof AudioContext !== "undefined" && AudioContext || typeof webkitAudioContext !== "undefined" && webkitAudioContext;
			if (!AudioContextCtor) {
				return null;
			}
			this._context = new AudioContextCtor();
			if (this._context.state !== CONTEXT_STATE_RUNNING) {
				this._registerUnlockListeners();
			}
		}
		return this._context;
	}
	suspend() {
		if (!this._userSuspended) {
			this._userSuspended = true;
			if (this._context && this._context.state === CONTEXT_STATE_RUNNING) {
				this._suspend();
			}
		}
	}
	resume() {
		if (this._userSuspended) {
			this._userSuspended = false;
			if (this._context && this._context.state !== CONTEXT_STATE_RUNNING) {
				this._resume();
			}
		}
	}
	destroy() {
		this.fire("destroy");
		const context = this._context;
		if (context) {
			this._removeUnlockListeners();
			context.close();
			this._context = null;
		}
	}
	// resume the sound context
	_resume() {
		const context = this._context;
		if (!context) return;
		context.resume().then(() => {
			const source = context.createBufferSource();
			source.buffer = context.createBuffer(1, 1, context.sampleRate);
			source.connect(context.destination);
			source.start(0);
			source.onended = (event) => {
				source.disconnect(0);
				this.fire("resume");
			};
		}, (e) => {
		}).catch((e) => {
		});
	}
	// resume the sound context and fire suspend event if it succeeds
	_suspend() {
		const context = this._context;
		if (!context) return;
		context.suspend().then(() => {
			this.fire("suspend");
		}, (e) => {
		}).catch((e) => {
		});
	}
	_unlockHandler() {
		this._removeUnlockListeners();
		if (!this._userSuspended && this._context && this._context.state !== CONTEXT_STATE_RUNNING) {
			this._resume();
		}
	}
	_registerUnlockListeners() {
		USER_INPUT_EVENTS.forEach((eventName) => {
			window.addEventListener(eventName, this._unlockHandlerFunc, false);
		});
	}
	_removeUnlockListeners() {
		USER_INPUT_EVENTS.forEach((eventName) => {
			window.removeEventListener(eventName, this._unlockHandlerFunc, false);
		});
	}
}
export {
	SoundManager
};
