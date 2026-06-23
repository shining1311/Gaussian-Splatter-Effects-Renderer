class FisheyeProjection {
	enabled = false;
	k = 1;
	invK = 1;
	cornerScale = 1;
	projMat00 = 1;
	projMat11 = 1;
	maxTheta = Math.PI;
	// Cached inputs for short-circuit check
	_lastT = -1;
	_lastFov = -1;
	_lastP00 = 0;
	_lastP11 = 0;
	update(t, fov, projMatrix) {
		if (projMatrix.data[15] === 1) {
			t = 0;
		}
		const p00 = projMatrix.data[0];
		const p11 = projMatrix.data[5];
		if (t === this._lastT && fov === this._lastFov && p00 === this._lastP00 && p11 === this._lastP11) {
			return;
		}
		this._lastT = t;
		this._lastFov = fov;
		this._lastP00 = p00;
		this._lastP11 = p11;
		if (t <= 0) {
			this.enabled = false;
			this.k = 1;
			this.invK = 1;
			this.cornerScale = 1;
			this.maxTheta = Math.PI;
			return;
		}
		this.enabled = true;
		const kMin = fov / 180 + 0.15;
		const kStart = Math.max(1, fov / 180 + 0.05);
		const k = kStart * Math.pow(kMin / kStart, t);
		this.k = k;
		this.invK = 1 / k;
		this.cornerScale = 1 + (Math.SQRT2 - 1) * t;
		const maxTheta = Math.min(k * Math.PI / 2, 3.13);
		const cs = this.cornerScale;
		const halfFovX = Math.atan2(1, p00);
		const effHalfFovX = Math.min(halfFovX, maxTheta - 0.01);
		this.projMat00 = cs / (k * Math.tan(effHalfFovX / k));
		const halfFovY = Math.atan2(1, p11);
		const effHalfFovY = Math.min(halfFovY, maxTheta - 0.01);
		this.projMat11 = cs / (k * Math.tan(effHalfFovY / k));
		this.maxTheta = maxTheta;
	}
}
export {
	FisheyeProjection
};
