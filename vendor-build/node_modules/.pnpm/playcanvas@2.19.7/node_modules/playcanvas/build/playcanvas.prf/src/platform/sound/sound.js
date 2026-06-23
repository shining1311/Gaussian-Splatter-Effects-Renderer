class Sound {
	buffer;
	constructor(buffer) {
		this.buffer = buffer;
	}
	get duration() {
		return this.buffer && this.buffer.duration || 0;
	}
}
export {
	Sound
};
