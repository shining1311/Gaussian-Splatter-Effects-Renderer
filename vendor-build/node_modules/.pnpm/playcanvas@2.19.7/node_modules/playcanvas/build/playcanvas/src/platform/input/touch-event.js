function getTouchTargetCoords(touch) {
	let totalOffsetX = 0;
	let totalOffsetY = 0;
	let target = touch.target;
	while (!(target instanceof HTMLElement) && target) {
		target = target.parentNode;
	}
	while (target) {
		totalOffsetX += target.offsetLeft - target.scrollLeft;
		totalOffsetY += target.offsetTop - target.scrollTop;
		target = target.offsetParent;
	}
	return {
		x: touch.pageX - totalOffsetX,
		y: touch.pageY - totalOffsetY
	};
}
class Touch {
	id;
	x;
	y;
	target;
	touch;
	constructor(touch) {
		const coords = getTouchTargetCoords(touch);
		this.id = touch.identifier;
		this.x = coords.x;
		this.y = coords.y;
		this.target = touch.target;
		this.touch = touch;
	}
}
class TouchEvent {
	element;
	event;
	touches = [];
	changedTouches = [];
	constructor(device, event) {
		this.element = event.target;
		this.event = event;
		this.touches = Array.from(event.touches).map((touch) => new Touch(touch));
		this.changedTouches = Array.from(event.changedTouches).map((touch) => new Touch(touch));
	}
	getTouchById(id, list) {
		return list.find((touch) => touch.id === id) || null;
	}
}
export {
	Touch,
	TouchEvent,
	getTouchTargetCoords
};
