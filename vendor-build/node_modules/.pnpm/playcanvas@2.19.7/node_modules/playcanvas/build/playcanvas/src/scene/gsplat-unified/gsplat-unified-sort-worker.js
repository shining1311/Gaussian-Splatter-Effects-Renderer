function UnifiedSortWorker() {
	const myself = typeof self !== "undefined" && self || require("node:worker_threads").parentPort;
	const centersMap = /* @__PURE__ */ new Map();
	let centersData;
	let distances;
	let countBuffer;
	let indexMap;
	let _radialSort = false;
	let _warnedSortKeyOverflow = false;
	const numBins = 32;
	const binBase = new Float32Array(numBins + 1);
	const binDivider = new Float32Array(numBins + 1);
	const binWeightsUtil = new GSplatSortBinWeights();
	const unpackBinWeights = (binWeights) => {
		for (let i = 0; i < numBins; i++) {
			binBase[i] = binWeights[i * 2];
			binDivider[i] = binWeights[i * 2 + 1];
		}
		binBase[numBins] = binBase[numBins - 1] + binDivider[numBins - 1];
		binDivider[numBins] = 0;
	};
	const evaluateSortKeysCommon = (sortParams, minDist, range, distances2, countBuffer2, centersData2, processSplatFn) => {
		const { ids, intervals } = centersData2;
		const invBinRange = numBins / range;
		let compactIdx = 0;
		for (let paramIdx = 0; paramIdx < sortParams.length; paramIdx++) {
			const params = sortParams[paramIdx];
			const id = ids[paramIdx];
			const centers = centersMap.get(id);
			if (!centers) {
				console.error("UnifiedSortWorker: No centers found for id", id);
			}
			const intervalsArray = intervals[paramIdx].length > 0 ? intervals[paramIdx] : [0, centers.length / 3];
			for (let i = 0; i < intervalsArray.length; i += 2) {
				const intervalStart = intervalsArray[i] * 3;
				const intervalEnd = intervalsArray[i + 1] * 3;
				compactIdx = processSplatFn(
					centers,
					params,
					intervalStart,
					intervalEnd,
					compactIdx,
					invBinRange,
					minDist,
					range,
					distances2,
					countBuffer2
				);
			}
		}
	};
	const evaluateSortKeysLinear = (sortParams, minDist, range, distances2, countBuffer2, centersData2) => {
		evaluateSortKeysCommon(
			sortParams,
			minDist,
			range,
			distances2,
			countBuffer2,
			centersData2,
			(centers, params, intervalStart, intervalEnd, compactIdx, invBinRange, minDist2, range2, distances3, countBuffer3) => {
				const { transformedDirection, offset, scale } = params;
				const dx = transformedDirection.x;
				const dy = transformedDirection.y;
				const dz = transformedDirection.z;
				const sdx = dx * scale;
				const sdy = dy * scale;
				const sdz = dz * scale;
				const add = offset - minDist2;
				for (let srcIndex = intervalStart; srcIndex < intervalEnd; srcIndex += 3) {
					const x = centers[srcIndex];
					const y = centers[srcIndex + 1];
					const z = centers[srcIndex + 2];
					const dist = x * sdx + y * sdy + z * sdz + add;
					const d = dist * invBinRange;
					const bin = d >>> 0;
					const sortKey = binBase[bin] + binDivider[bin] * (d - bin) >>> 0;
					distances3[compactIdx++] = sortKey;
					countBuffer3[sortKey]++;
				}
				return compactIdx;
			}
		);
	};
	const evaluateSortKeysRadial = (sortParams, minDist, range, distances2, countBuffer2, centersData2) => {
		evaluateSortKeysCommon(
			sortParams,
			minDist,
			range,
			distances2,
			countBuffer2,
			centersData2,
			(centers, params, intervalStart, intervalEnd, compactIdx, invBinRange, minDist2, range2, distances3, countBuffer3) => {
				const { transformedPosition, scale } = params;
				const cx = transformedPosition.x;
				const cy = transformedPosition.y;
				const cz = transformedPosition.z;
				for (let srcIndex = intervalStart; srcIndex < intervalEnd; srcIndex += 3) {
					const dx = centers[srcIndex] - cx;
					const dy = centers[srcIndex + 1] - cy;
					const dz = centers[srcIndex + 2] - cz;
					const distSq = dx * dx + dy * dy + dz * dz;
					const dist = Math.sqrt(distSq) * scale;
					const invertedDist = range2 - dist;
					const d = invertedDist * invBinRange;
					const bin = d >>> 0;
					const sortKey = binBase[bin] + binDivider[bin] * (d - bin) >>> 0;
					distances3[compactIdx++] = sortKey;
					countBuffer3[sortKey]++;
				}
				return compactIdx;
			}
		);
	};
	const countingSort = (bucketCount, countBuffer2, numVertices, distances2, order) => {
		for (let i = 1; i < bucketCount; i++) {
			countBuffer2[i] += countBuffer2[i - 1];
		}
		const validCount = countBuffer2[bucketCount - 1];
		if (validCount !== numVertices && !_warnedSortKeyOverflow) {
			_warnedSortKeyOverflow = true;
			console.warn(`[SortWorker] ${numVertices - validCount} splats lost due to sortKey overflow. Check resource AABB bounds contain all the splats.`);
		}
		for (let i = 0; i < numVertices; i++) {
			const distance = distances2[i];
			const destIndex = --countBuffer2[distance];
			order[destIndex] = indexMap[i];
		}
	};
	const computeEffectiveDistanceRangeLinear = (sortParams) => {
		let minDist = Infinity;
		let maxDist = -Infinity;
		for (let paramIdx = 0; paramIdx < sortParams.length; paramIdx++) {
			const params = sortParams[paramIdx];
			const { transformedDirection, offset, scale, aabbMin, aabbMax } = params;
			const dx = transformedDirection.x;
			const dy = transformedDirection.y;
			const dz = transformedDirection.z;
			const pxMin = dx >= 0 ? aabbMin[0] : aabbMax[0];
			const pyMin = dy >= 0 ? aabbMin[1] : aabbMax[1];
			const pzMin = dz >= 0 ? aabbMin[2] : aabbMax[2];
			const pxMax = dx >= 0 ? aabbMax[0] : aabbMin[0];
			const pyMax = dy >= 0 ? aabbMax[1] : aabbMin[1];
			const pzMax = dz >= 0 ? aabbMax[2] : aabbMin[2];
			const dMin = pxMin * dx + pyMin * dy + pzMin * dz;
			const dMax = pxMax * dx + pyMax * dy + pzMax * dz;
			const eMin = dMin * scale + offset;
			const eMax = dMax * scale + offset;
			const localMin = Math.min(eMin, eMax);
			const localMax = Math.max(eMin, eMax);
			if (localMin < minDist) minDist = localMin;
			if (localMax > maxDist) maxDist = localMax;
		}
		if (minDist === Infinity) {
			minDist = 0;
			maxDist = 0;
		}
		return { minDist, maxDist };
	};
	const computeEffectiveDistanceRangeRadial = (sortParams) => {
		let maxDist = -Infinity;
		for (let paramIdx = 0; paramIdx < sortParams.length; paramIdx++) {
			const params = sortParams[paramIdx];
			const { transformedPosition, scale, aabbMin, aabbMax } = params;
			const cx = transformedPosition.x;
			const cy = transformedPosition.y;
			const cz = transformedPosition.z;
			for (let i = 0; i < 8; i++) {
				const px = i & 1 ? aabbMax[0] : aabbMin[0];
				const py = i & 2 ? aabbMax[1] : aabbMin[1];
				const pz = i & 4 ? aabbMax[2] : aabbMin[2];
				const dx = px - cx;
				const dy = py - cy;
				const dz = pz - cz;
				const distSq = dx * dx + dy * dy + dz * dz;
				const dist = Math.sqrt(distSq) * scale;
				if (dist > maxDist) maxDist = dist;
			}
		}
		const minDist = 0;
		if (maxDist < 0) {
			maxDist = 0;
		}
		return { minDist, maxDist };
	};
	const sort = (sortParams, order, centersData2) => {
		const sortStartTime = performance.now();
		const { minDist, maxDist } = _radialSort ? computeEffectiveDistanceRangeRadial(sortParams) : computeEffectiveDistanceRangeLinear(sortParams);
		const numVertices = centersData2.totalActiveSplats;
		const compareBits = Math.max(10, Math.min(20, Math.round(Math.log2(numVertices / 4))));
		const bucketCount = 2 ** compareBits + 1;
		if (distances?.length !== numVertices) {
			distances = new Uint32Array(numVertices);
		}
		if (!countBuffer || countBuffer.length !== bucketCount) {
			countBuffer = new Uint32Array(bucketCount);
		} else {
			countBuffer.fill(0);
		}
		const range = maxDist - minDist;
		const cameraBin = GSplatSortBinWeights.computeCameraBin(_radialSort, minDist, range);
		const binWeights = binWeightsUtil.compute(cameraBin, bucketCount);
		unpackBinWeights(binWeights);
		if (_radialSort) {
			evaluateSortKeysRadial(sortParams, minDist, range, distances, countBuffer, centersData2);
		} else {
			evaluateSortKeysLinear(sortParams, minDist, range, distances, countBuffer, centersData2);
		}
		countingSort(bucketCount, countBuffer, numVertices, distances, order);
		const count = numVertices;
		const sortTime = performance.now() - sortStartTime;
		const transferList = [order.buffer];
		const response = {
			order: order.buffer,
			count,
			version: centersData2.version,
			sortTime
		};
		myself.postMessage(response, transferList);
	};
	const buildIndexMap = (data) => {
		const { ids, pixelOffsets, intervals, totalActiveSplats } = data;
		if (!indexMap || indexMap.length < totalActiveSplats) {
			indexMap = new Uint32Array(totalActiveSplats);
		}
		let compactIdx = 0;
		for (let paramIdx = 0; paramIdx < ids.length; paramIdx++) {
			const centers = centersMap.get(ids[paramIdx]);
			const offsets = pixelOffsets[paramIdx];
			const intervalsArray = intervals[paramIdx].length > 0 ? intervals[paramIdx] : [0, centers.length / 3];
			for (let i = 0; i < intervalsArray.length; i += 2) {
				let workBufferIndex = offsets[i / 2];
				const count = intervalsArray[i + 1] - intervalsArray[i];
				for (let j = 0; j < count; j++) {
					indexMap[compactIdx++] = workBufferIndex++;
				}
			}
		}
	};
	myself.addEventListener("message", (message) => {
		const msgData = message.data ?? message;
		switch (msgData.command) {
			// add centers to map
			case "addCenters": {
				centersMap.set(msgData.id, new Float32Array(msgData.centers));
				break;
			}
			// remove centers from map
			case "removeCenters": {
				centersMap.delete(msgData.id);
				break;
			}
			// sort
			case "sort": {
				_radialSort = msgData.radialSorting || false;
				const order = new Uint32Array(msgData.order);
				sort(msgData.sortParams, order, centersData);
				break;
			}
			// intervals
			case "intervals": {
				centersData = msgData;
				buildIndexMap(centersData);
				break;
			}
		}
	});
}
export {
	UnifiedSortWorker
};
