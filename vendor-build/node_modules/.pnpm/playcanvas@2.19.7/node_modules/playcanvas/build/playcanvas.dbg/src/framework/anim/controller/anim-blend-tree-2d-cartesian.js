var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec2 } from "../../../core/math/vec2.js";
import { math } from "../../../core/math/math.js";
import { AnimBlendTree } from "./anim-blend-tree.js";
const _AnimBlendTreeCartesian2D = class _AnimBlendTreeCartesian2D extends AnimBlendTree {
  pointDistanceCache(i, j) {
    const pointKey = `${i}${j}`;
    if (!this._pointCache[pointKey]) {
      this._pointCache[pointKey] = this._children[j].point.clone().sub(this._children[i].point);
    }
    return this._pointCache[pointKey];
  }
  calculateWeights() {
    if (this.updateParameterValues()) return;
    let weightSum, weightedDurationSum;
    _AnimBlendTreeCartesian2D._p.set(...this._parameterValues);
    weightSum = 0;
    weightedDurationSum = 0;
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      const pi = child.point;
      _AnimBlendTreeCartesian2D._pip.set(_AnimBlendTreeCartesian2D._p.x, _AnimBlendTreeCartesian2D._p.y).sub(pi);
      let minj = Number.MAX_VALUE;
      for (let j = 0; j < this._children.length; j++) {
        if (i === j) continue;
        const pipj = this.pointDistanceCache(i, j);
        const result = math.clamp(1 - _AnimBlendTreeCartesian2D._pip.dot(pipj) / pipj.lengthSq(), 0, 1);
        if (result < minj) minj = result;
      }
      child.weight = minj;
      weightSum += minj;
      if (this._syncAnimations) {
        weightedDurationSum += child.animTrack.duration / child.absoluteSpeed * child.weight;
      }
    }
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      child.weight = child._weight / weightSum;
      if (this._syncAnimations) {
        child.weightedSpeed = child.animTrack.duration / child.absoluteSpeed / weightedDurationSum;
      }
    }
  }
};
__publicField(_AnimBlendTreeCartesian2D, "_p", new Vec2());
__publicField(_AnimBlendTreeCartesian2D, "_pip", new Vec2());
let AnimBlendTreeCartesian2D = _AnimBlendTreeCartesian2D;
export {
  AnimBlendTreeCartesian2D
};
