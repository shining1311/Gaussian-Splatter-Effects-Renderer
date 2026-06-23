import { math } from "./math.js";
const _goldenAngle = 2.399963229728653;
const random = {
	circlePoint(point) {
		const r = Math.sqrt(Math.random());
		const theta = Math.random() * 2 * Math.PI;
		point.x = r * Math.cos(theta);
		point.y = r * Math.sin(theta);
	},
	circlePointDeterministic(point, index, numPoints) {
		const theta = index * _goldenAngle;
		const r = Math.sqrt(index / numPoints);
		point.x = r * Math.cos(theta);
		point.y = r * Math.sin(theta);
	},
	spherePointDeterministic(point, index, numPoints, start = 0, end = 1) {
		start = 1 - 2 * start;
		end = 1 - 2 * end;
		const y = math.lerp(start, end, index / numPoints);
		const radius = Math.sqrt(1 - y * y);
		const theta = _goldenAngle * index;
		point.x = Math.cos(theta) * radius;
		point.y = y;
		point.z = Math.sin(theta) * radius;
	},
	radicalInverse(i) {
		let bits = (i << 16 | i >>> 16) >>> 0;
		bits = ((bits & 1431655765) << 1 | (bits & 2863311530) >>> 1) >>> 0;
		bits = ((bits & 858993459) << 2 | (bits & 3435973836) >>> 2) >>> 0;
		bits = ((bits & 252645135) << 4 | (bits & 4042322160) >>> 4) >>> 0;
		bits = ((bits & 16711935) << 8 | (bits & 4278255360) >>> 8) >>> 0;
		return bits * 23283064365386963e-26;
	}
};
export {
	random
};
