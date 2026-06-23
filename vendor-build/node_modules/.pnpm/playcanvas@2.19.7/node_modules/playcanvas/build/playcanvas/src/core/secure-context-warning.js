const warnInsecureContext = (feature) => {
	if (typeof window === "undefined") return;
	if (window.isSecureContext !== false) return;
};
export {
	warnInsecureContext
};
