class AnimBinder {
	// join a list of path segments into a path string using the full stop character. If another character is supplied,
	// it will join using that character instead
	static joinPath(pathSegments, character) {
		character = character || ".";
		const escape = function(string) {
			return string.replace(/\\/g, "\\\\").replace(new RegExp(`\\${character}`, "g"), `\\${character}`);
		};
		return pathSegments.map(escape).join(character);
	}
	// split a path string into its segments and resolve character escaping
	static splitPath(path, character) {
		character = character || ".";
		const result = [];
		let curr = "";
		let i = 0;
		while (i < path.length) {
			let c = path[i++];
			if (c === "\\" && i < path.length) {
				c = path[i++];
				if (c === "\\" || c === character) {
					curr += c;
				} else {
					curr += `\\${c}`;
				}
			} else if (c === character) {
				result.push(curr);
				curr = "";
			} else {
				curr += c;
			}
		}
		if (curr.length > 0) {
			result.push(curr);
		}
		return result;
	}
	static encode(entityPath, component, propertyPath) {
		return `${Array.isArray(entityPath) ? entityPath.join("/") : entityPath}/${component}/${Array.isArray(propertyPath) ? propertyPath.join("/") : propertyPath}`;
	}
	resolve(path) {
		return null;
	}
	unresolve(path) {
	}
	update(deltaTime) {
	}
}
export {
	AnimBinder
};
