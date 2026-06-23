import { getApplication } from "./globals.js";
let _createdLoadingScreen = false;
const script = {
	// set during script load to be used for initializing script
	app: null,
	createLoadingScreen(callback) {
		if (_createdLoadingScreen) {
			return;
		}
		_createdLoadingScreen = true;
		const app = getApplication();
		callback(app);
	}
};
export {
	script
};
