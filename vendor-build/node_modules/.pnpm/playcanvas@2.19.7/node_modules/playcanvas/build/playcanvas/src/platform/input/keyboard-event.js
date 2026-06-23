class KeyboardEvent {
	key = null;
	element = null;
	event = null;
	constructor(keyboard, event) {
		if (event) {
			this.key = event.keyCode;
			this.element = event.target;
			this.event = event;
		}
	}
}
export {
	KeyboardEvent
};
