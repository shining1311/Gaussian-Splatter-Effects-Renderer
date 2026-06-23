import { calculateNormals, calculateTangents } from "./geometry-utils.js";
class Geometry {
	positions;
	normals;
	colors;
	uvs;
	uvs1;
	blendIndices;
	blendWeights;
	tangents;
	indices;
	calculateNormals() {
		this.normals = calculateNormals(this.positions, this.indices);
	}
	calculateTangents() {
		this.tangents = calculateTangents(this.positions, this.normals, this.uvs, this.indices);
	}
}
export {
	Geometry
};
