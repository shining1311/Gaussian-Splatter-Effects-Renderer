import { EventHandler } from "../../core/event-handler.js";
import { TouchEvent } from "./touch-event.js";
class TouchDevice extends EventHandler {
	static EVENT_TOUCHSTART = "touchstart";
	static EVENT_TOUCHEND = "touchend";
	static EVENT_TOUCHMOVE = "touchmove";
	static EVENT_TOUCHCANCEL = "touchcancel";
	_element = null;
	_startHandler;
	_endHandler;
	_moveHandler;
	_cancelHandler;
	constructor(element) {
		super();
		this._startHandler = this._handleTouchStart.bind(this);
		this._endHandler = this._handleTouchEnd.bind(this);
		this._moveHandler = this._handleTouchMove.bind(this);
		this._cancelHandler = this._handleTouchCancel.bind(this);
		this.attach(element);
	}
	attach(element) {
		if (this._element) {
			this.detach();
		}
		this._element = element;
		this._element.addEventListener("touchstart", this._startHandler, false);
		this._element.addEventListener("touchend", this._endHandler, false);
		this._element.addEventListener("touchmove", this._moveHandler, false);
		this._element.addEventListener("touchcancel", this._cancelHandler, false);
	}
	detach() {
		if (this._element) {
			this._element.removeEventListener("touchstart", this._startHandler, false);
			this._element.removeEventListener("touchend", this._endHandler, false);
			this._element.removeEventListener("touchmove", this._moveHandler, false);
			this._element.removeEventListener("touchcancel", this._cancelHandler, false);
		}
		this._element = null;
	}
	_handleTouchStart(e) {
		this.fire("touchstart", new TouchEvent(this, e));
	}
	_handleTouchEnd(e) {
		this.fire("touchend", new TouchEvent(this, e));
	}
	_handleTouchMove(e) {
		e.preventDefault();
		this.fire("touchmove", new TouchEvent(this, e));
	}
	_handleTouchCancel(e) {
		this.fire("touchcancel", new TouchEvent(this, e));
	}
}
export {
	TouchDevice
};
