import { EventHandler } from "../../core/event-handler.js";
import { platform } from "../../core/platform.js";
import { UploadStream } from "../../platform/graphics/upload-stream.js";
import { SortWorker } from "./gsplat-sort-worker.js";
class GSplatSorter extends EventHandler {
	worker;
	target;
	orderData;
	centers;
	scene;
	uploadStream;
	pendingSorted = null;
	constructor(device, scene) {
		super();
		this.scene = scene ?? null;
		this.uploadStream = new UploadStream(device, !device.isWebGPU);
		const messageHandler = (message) => {
			const msgData = message.data ?? message;
			if (this.scene && msgData.sortTime !== void 0) {
				this.scene.fire("gsplat:sorted", msgData.sortTime);
			}
			const newOrder = msgData.order;
			const oldOrder = this.orderData;
			this.worker.postMessage({
				order: oldOrder
			}, [oldOrder]);
			this.orderData = newOrder;
			this.pendingSorted = {
				count: msgData.count,
				data: new Uint32Array(newOrder)
			};
			this.fire("updated");
		};
		const workerSource = `(${SortWorker.toString()})()`;
		if (platform.environment === "node") {
			this.worker = new Worker(workerSource, {
				eval: true
			});
			this.worker.on("message", messageHandler);
		} else {
			this.worker = new Worker(URL.createObjectURL(new Blob([workerSource], {
				type: "application/javascript"
			})));
			this.worker.addEventListener("message", messageHandler);
		}
	}
	destroy() {
		this.worker.terminate();
		this.worker = null;
		this.uploadStream.destroy();
		this.uploadStream = null;
	}
	init(target, numSplats, centers, chunks) {
		this.target = target;
		this.centers = centers.slice();
		const orderBuffer = new Uint32Array(numSplats);
		for (let i = 0; i < numSplats; ++i) {
			orderBuffer[i] = i;
		}
		this.orderData = new ArrayBuffer(numSplats * 4);
		const obj = {
			order: orderBuffer.buffer,
			centers: centers.buffer,
			chunks: chunks?.buffer
		};
		const transfer = [orderBuffer.buffer, centers.buffer].concat(chunks ? [chunks.buffer] : []);
		this.worker.postMessage(obj, transfer);
	}
	applyPendingSorted() {
		if (this.pendingSorted) {
			const { count, data } = this.pendingSorted;
			this.pendingSorted = null;
			this.uploadStream.upload(data, this.target);
			return count;
		}
		return -1;
	}
	setMapping(mapping) {
		if (mapping) {
			const centers = new Float32Array(mapping.length * 3);
			for (let i = 0; i < mapping.length; ++i) {
				const src = mapping[i] * 3;
				const dst = i * 3;
				centers[dst + 0] = this.centers[src + 0];
				centers[dst + 1] = this.centers[src + 1];
				centers[dst + 2] = this.centers[src + 2];
			}
			this.worker.postMessage({
				centers: centers.buffer,
				mapping: mapping.buffer
			}, [centers.buffer, mapping.buffer]);
		} else {
			const centers = this.centers.slice();
			this.worker.postMessage({
				centers: centers.buffer,
				mapping: null
			}, [centers.buffer]);
		}
	}
	setCamera(pos, dir) {
		this.worker.postMessage({
			cameraPosition: { x: pos.x, y: pos.y, z: pos.z },
			cameraDirection: { x: dir.x, y: dir.y, z: dir.z }
		});
	}
}
export {
	GSplatSorter
};
