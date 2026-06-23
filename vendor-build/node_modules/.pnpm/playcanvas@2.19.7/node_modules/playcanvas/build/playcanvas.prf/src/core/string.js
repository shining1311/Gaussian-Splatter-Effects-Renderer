const ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const ASCII_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ASCII_LETTERS = ASCII_LOWERCASE + ASCII_UPPERCASE;
const HIGH_SURROGATE_BEGIN = 55296;
const HIGH_SURROGATE_END = 56319;
const LOW_SURROGATE_BEGIN = 56320;
const LOW_SURROGATE_END = 57343;
const ZERO_WIDTH_JOINER = 8205;
const REGIONAL_INDICATOR_BEGIN = 127462;
const REGIONAL_INDICATOR_END = 127487;
const FITZPATRICK_MODIFIER_BEGIN = 127995;
const FITZPATRICK_MODIFIER_END = 127999;
const DIACRITICAL_MARKS_BEGIN = 8400;
const DIACRITICAL_MARKS_END = 8447;
const VARIATION_MODIFIER_BEGIN = 65024;
const VARIATION_MODIFIER_END = 65039;
function getCodePointData(string2, i = 0) {
	const size = string2.length;
	if (i < 0 || i >= size) {
		return null;
	}
	const first = string2.charCodeAt(i);
	if (size > 1 && first >= HIGH_SURROGATE_BEGIN && first <= HIGH_SURROGATE_END) {
		const second = string2.charCodeAt(i + 1);
		if (second >= LOW_SURROGATE_BEGIN && second <= LOW_SURROGATE_END) {
			return {
				code: (first - HIGH_SURROGATE_BEGIN) * 1024 + second - LOW_SURROGATE_BEGIN + 65536,
				long: true
			};
		}
	}
	return {
		code: first,
		long: false
	};
}
function isCodeBetween(string2, begin, end) {
	if (!string2) {
		return false;
	}
	const codeData = getCodePointData(string2);
	if (codeData) {
		const code = codeData.code;
		return code >= begin && code <= end;
	}
	return false;
}
function numCharsToTakeForNextSymbol(string2, index) {
	if (index === string2.length - 1) {
		return 1;
	}
	if (isCodeBetween(string2[index], HIGH_SURROGATE_BEGIN, HIGH_SURROGATE_END)) {
		const first = string2.substring(index, index + 2);
		const second = string2.substring(index + 2, index + 4);
		if (isCodeBetween(second, FITZPATRICK_MODIFIER_BEGIN, FITZPATRICK_MODIFIER_END) || isCodeBetween(first, REGIONAL_INDICATOR_BEGIN, REGIONAL_INDICATOR_END) && isCodeBetween(second, REGIONAL_INDICATOR_BEGIN, REGIONAL_INDICATOR_END)) {
			return 4;
		}
		if (isCodeBetween(second, VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
			return 3;
		}
		return 2;
	}
	if (isCodeBetween(string2[index + 1], VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
		return 2;
	}
	return 1;
}
const string = {
	ASCII_LOWERCASE,
	ASCII_UPPERCASE,
	ASCII_LETTERS,
	format(s, ...args) {
		for (let i = 0; i < args.length; i++) {
			s = s.replace(`{${i}}`, args[i]);
		}
		return s;
	},
	getCodePoint(string2, i) {
		const codePointData = getCodePointData(string2, i);
		return codePointData && codePointData.code;
	},
	getCodePoints(string2) {
		if (typeof string2 !== "string") {
			throw new TypeError("Not a string");
		}
		let i = 0;
		const arr = [];
		let codePoint;
		while (!!(codePoint = getCodePointData(string2, i))) {
			arr.push(codePoint.code);
			i += codePoint.long ? 2 : 1;
		}
		return arr;
	},
	getSymbols(string2) {
		if (typeof string2 !== "string") {
			throw new TypeError("Not a string");
		}
		let index = 0;
		const length = string2.length;
		const output = [];
		let take = 0;
		let ch;
		while (index < length) {
			take += numCharsToTakeForNextSymbol(string2, index + take);
			ch = string2[index + take];
			if (isCodeBetween(ch, DIACRITICAL_MARKS_BEGIN, DIACRITICAL_MARKS_END)) {
				ch = string2[index + take++];
			}
			if (isCodeBetween(ch, VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
				ch = string2[index + take++];
			}
			if (ch && ch.charCodeAt(0) === ZERO_WIDTH_JOINER) {
				ch = string2[index + take++];
				continue;
			}
			const char = string2.substring(index, index + take);
			output.push(char);
			index += take;
			take = 0;
		}
		return output;
	},
	fromCodePoint(...args) {
		return args.map((codePoint) => {
			if (codePoint > 65535) {
				codePoint -= 65536;
				return String.fromCharCode(
					(codePoint >> 10) + 55296,
					codePoint % 1024 + 56320
				);
			}
			return String.fromCharCode(codePoint);
		}).join("");
	}
};
export {
	string
};
