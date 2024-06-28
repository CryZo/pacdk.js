import PacdkHelpers from "./PacdkHelpers";
import ScriptTarget from "./ScriptTarget";

export default class Object extends ScriptTarget {
  public id: string;
  public script: (context: EventTarget)=> Promise<void>;

  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;

  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }
  public get z(): number {
    return this._z;
  }
  

  private imgEl?: HTMLImageElement;

  private assetId: string = '';
  // TODO Animationen??!?
  // TODO States
  
  constructor(id: string, script: (context: EventTarget)=> Promise<void>) {
    super();
    this.id = id;
    this.script = script.bind(this);
    this.script(this);
  }

  public setPos(x: number, y: number, z?: number) {
    this._x = x;
    this._y = y;

    if (z)
      this._z = z;
    
    if (this.imgEl) {
      this.imgEl.style.left = (this._x * window.PacdkInternalVariablesModel.PixelScale) + 'px';
      this.imgEl.style.top = (this._y * window.PacdkInternalVariablesModel.PixelScale) + 'px';
    }

    return this;
  }

  public setImg(assetId: string) {
    this.assetId = assetId;
    
    return this;
  }

  public async getImgElement() {
    this.imgEl = document.createElement('img');
    try {
      this.imgEl.src = await window.PacdkAssetStorage.getAsset(this.assetId, 'gfx');
    }
    catch (error) {
      console.error(`Cant fetch asset "${this.assetId}" for object "${this.id}"`, error)
    }
    this.imgEl.classList.add('object');
    this.imgEl.dataset.objectId = this.id;
    this.imgEl.dataset.assetId = this.assetId;
    this.imgEl.style.left = (this._x * window.PacdkInternalVariablesModel.PixelScale) + 'px';
    this.imgEl.style.top = (this._y * window.PacdkInternalVariablesModel.PixelScale) + 'px';

    PacdkHelpers.addMouseEvents(this, this.imgEl);

    return this.imgEl;
  }
}
