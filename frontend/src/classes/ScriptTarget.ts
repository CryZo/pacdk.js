export default abstract class ScriptTarget extends EventTarget {
  protected _isActive: boolean = false;
  public get isActive(): boolean {
    return this._isActive;
  }
  public set isActive(v: boolean) {
    this._isActive = v;
    // this.dispatchLoops();
  }

  constructor() {
    super();
  }

  // protected dispatchLoops(): void {}
}
