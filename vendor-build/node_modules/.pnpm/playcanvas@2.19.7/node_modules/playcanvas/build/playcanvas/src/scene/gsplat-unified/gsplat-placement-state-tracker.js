class GSplatPlacementStateTracker {
	_states = /* @__PURE__ */ new WeakMap();
	hasChanges(placements) {
		let changed = false;
		for (const p of placements) {
			if (!p.resource) continue;
			const formatVersion = p.resource.format?.extraStreamsVersion ?? 0;
			const modifierHash = p.workBufferModifier?.hash ?? 0;
			const numSplats = p.resource.numSplats ?? 0;
			const centersVersion = p.resource.centersVersion;
			const state = this._states.get(p);
			if (!state) {
				this._states.set(p, { formatVersion, modifierHash, numSplats, centersVersion });
				changed = true;
			} else if (state.formatVersion !== formatVersion || state.modifierHash !== modifierHash || state.numSplats !== numSplats || state.centersVersion !== centersVersion) {
				state.formatVersion = formatVersion;
				state.modifierHash = modifierHash;
				state.numSplats = numSplats;
				state.centersVersion = centersVersion;
				changed = true;
			}
		}
		return changed;
	}
}
export {
	GSplatPlacementStateTracker
};
