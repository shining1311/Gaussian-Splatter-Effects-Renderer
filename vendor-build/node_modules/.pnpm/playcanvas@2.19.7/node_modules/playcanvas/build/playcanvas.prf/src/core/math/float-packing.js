const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);
class FloatPacking {
	static float2Half(value) {
		floatView[0] = value;
		const x = int32View[0];
		let bits = x >> 16 & 32768;
		let m = x >> 12 & 2047;
		const e = x >> 23 & 255;
		if (e < 103) {
			return bits;
		}
		if (e > 142) {
			bits |= 31744;
			bits |= (e === 255 ? 0 : 1) && x & 8388607;
			return bits;
		}
		if (e < 113) {
			m |= 2048;
			bits |= (m >> 114 - e) + (m >> 113 - e & 1);
			return bits;
		}
		bits |= e - 112 << 10 | m >> 1;
		bits += m & 1;
		return bits;
	}
	static float2RGBA8(value, data) {
		floatView[0] = value;
		const intBits = int32View[0];
		data.r = (intBits >> 24 & 255) / 255;
		data.g = (intBits >> 16 & 255) / 255;
		data.b = (intBits >> 8 & 255) / 255;
		data.a = (intBits & 255) / 255;
	}
}
export {
	FloatPacking
};
