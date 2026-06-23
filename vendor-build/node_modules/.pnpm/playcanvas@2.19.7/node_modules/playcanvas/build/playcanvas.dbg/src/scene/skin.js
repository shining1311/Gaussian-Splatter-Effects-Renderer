class Skin {
  /**
   * Create a new Skin instance.
   *
   * @param {GraphicsDevice} graphicsDevice - The graphics device used to manage this skin.
   * @param {Mat4[]} ibp - The array of inverse bind matrices.
   * @param {string[]} boneNames - The array of bone names for the bones referenced by this skin.
   */
  constructor(graphicsDevice, ibp, boneNames) {
    this.device = graphicsDevice;
    this.inverseBindPose = ibp;
    this.boneNames = boneNames;
  }
}
export {
  Skin
};
