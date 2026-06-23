const damp = (damping, dt) => 1 - Math.pow(damping, dt * 1e3);
export {
  damp
};
