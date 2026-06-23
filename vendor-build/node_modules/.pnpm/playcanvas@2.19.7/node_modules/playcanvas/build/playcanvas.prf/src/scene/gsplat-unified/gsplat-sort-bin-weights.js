class GSplatSortBinWeights {
	static get NUM_BINS() {
		return 32;
	}
	static get WEIGHT_TIERS() {
		return [
			{ maxDistance: 0, weight: 40 },
			// Camera bin
			{ maxDistance: 2, weight: 20 },
			// Adjacent bins
			{ maxDistance: 5, weight: 8 },
			// Nearby bins
			{ maxDistance: 10, weight: 3 },
			// Medium distance
			{ maxDistance: Infinity, weight: 1 }
			// Far bins
		];
	}
	constructor() {
		const numBins = GSplatSortBinWeights.NUM_BINS;
		const weightTiers = GSplatSortBinWeights.WEIGHT_TIERS;
		this.binWeights = new Float32Array(numBins * 2);
		this.bitsPerBin = new Float32Array(numBins);
		this.weightByDistance = new Float32Array(numBins);
		for (let dist = 0; dist < numBins; dist++) {
			let weight = 1;
			for (let j = 0; j < weightTiers.length; j++) {
				if (dist <= weightTiers[j].maxDistance) {
					weight = weightTiers[j].weight;
					break;
				}
			}
			this.weightByDistance[dist] = weight;
		}
		this.lastCameraBin = -1;
		this.lastBucketCount = -1;
	}
	static computeCameraBin(radialSort, minDist, range) {
		const numBins = GSplatSortBinWeights.NUM_BINS;
		if (radialSort) {
			return numBins - 1;
		}
		const cameraOffsetFromRangeStart = -minDist;
		const cameraBinFloat = cameraOffsetFromRangeStart / range * numBins;
		return Math.max(0, Math.min(numBins - 1, Math.floor(cameraBinFloat)));
	}
	compute(cameraBin, bucketCount) {
		if (cameraBin === this.lastCameraBin && bucketCount === this.lastBucketCount) {
			return this.binWeights;
		}
		this.lastCameraBin = cameraBin;
		this.lastBucketCount = bucketCount;
		const numBins = GSplatSortBinWeights.NUM_BINS;
		const bitsPerBin = this.bitsPerBin;
		for (let i = 0; i < numBins; i++) {
			const distFromCamera = Math.abs(i - cameraBin);
			bitsPerBin[i] = this.weightByDistance[distFromCamera];
		}
		let totalWeight = 0;
		for (let i = 0; i < numBins; i++) {
			totalWeight += bitsPerBin[i];
		}
		let accumulated = 0;
		for (let i = 0; i < numBins; i++) {
			const divider = Math.max(1, Math.floor(bitsPerBin[i] / totalWeight * bucketCount));
			this.binWeights[i * 2] = accumulated;
			this.binWeights[i * 2 + 1] = divider;
			accumulated += divider;
		}
		if (accumulated > bucketCount) {
			const excess = accumulated - bucketCount;
			const lastDividerIdx = (numBins - 1) * 2 + 1;
			this.binWeights[lastDividerIdx] = Math.max(1, this.binWeights[lastDividerIdx] - excess);
		}
		return this.binWeights;
	}
}
export {
	GSplatSortBinWeights
};
