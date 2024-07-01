import Character from "./Character";
import PacdkObject from "./Object";
import PacdkFunctions from "./PacdkFunctions";
import PacdkHelpers from "./PacdkHelpers";
import ScriptTarget from "./ScriptTarget";

export default class Room extends ScriptTarget {
  public id: string;
  public script: (context: EventTarget)=> Promise<void>;

  public objects: {[key: string]: PacdkObject} = {};
  private characters: {[key: string]: Character} = {};

  private rootEl: HTMLDivElement;
  private imgEl?: HTMLImageElement;
  private assetId: string = '';

  private animationInterval?: NodeJS.Timeout;

  private loop1?: (context: ScriptTarget) => Promise<void>;
  private loop2?: (context: ScriptTarget) => Promise<void>;

  private loop1Running: boolean = false;
  private loop2Running: boolean = false;

  private loop1Interval?: NodeJS.Timeout;
  private loop2Interval?: NodeJS.Timeout;

  public walkmapSize: number = 20;
  public topOffset: number = 1;
  public bottomOffset: number = 23;
  public height: number = 0;
  public width: number = 0;

  public get topOffsetPx() {
    return this.height / 24 * this.topOffset;
  }
  
  constructor(id: string, script: (context: EventTarget)=> Promise<void>) {
    super();
    this.id = id;
    
    this.rootEl = document.createElement('div');
    this.rootEl.classList.add('room');
    this.rootEl.dataset.roomId = this.id;
    this.rootEl.innerHTML = ' '

    this.rootEl.addEventListener('click', e => {
      if (e.target === this.rootEl) {
        const x = Math.floor(e.offsetX * window.PacdkInternalVariablesModel.PixelScale / this.walkmapSize);
        const y = Math.floor(e.offsetY * window.PacdkInternalVariablesModel.PixelScale / this.walkmapSize);

        PacdkFunctions.walkto('self', x, y);
      }
    });

    this.script = script.bind(this);
    this.script(this);
  }

  public async enter() {
    this.applyActiveState(true);
    this.dispatchEvent(new Event('enter'));

    if (window.PacdkVariablesModel.currentroom)
      window.PacdkFunctionModel.Room![PacdkHelpers.nameToId(window.PacdkVariablesModel.currentroom)].leave();

    window.PacdkVariablesModel.currentroom = this.id;

    await this.render();

    this.animationInterval = setInterval(() => {
      for (const key in this.characters) {
        if (Object.prototype.hasOwnProperty.call(this.characters, key)) {
          const char = this.characters[key];
          char.renderAnimationFrame();
        }
      }
    }, 100);

    this.dispatchLoops();
  }

  public leave() {
    this.dispatchEvent(new Event('leave'));
    clearInterval(this.animationInterval);
    this.applyActiveState(false);
    
    clearInterval(this.loop1Interval!);
    clearInterval(this.loop2Interval!);

    this.rootEl.remove();
    window.PacdkVariablesModel.currentroom = '';
  }

  private applyActiveState(state: boolean) {
    this.isActive = state;
    
    for (const key in this.objects) {
      if (Object.prototype.hasOwnProperty.call(this.objects, key)) {
        const object = this.objects[key];
        object.isActive = state;
      }
    }
    
    for (const key in this.characters) {
      if (Object.prototype.hasOwnProperty.call(this.characters, key)) {
        const character = this.characters[key];
        character.isActive = state;
      }
    }
  }

  private async render() {
    if (!this.isActive)
      return;

    document.body.querySelectorAll('.room').forEach(room => room.remove());
    document.body.appendChild(this.rootEl);

    this.rootEl.append(await this.getImgElement());

    const sortedObjectKeys = Object.keys(this.objects).sort((key1, key2) => this.objects[key1].z - this.objects[key2].z);
    for (let i = 0; i < sortedObjectKeys.length; i++) {
      this.rootEl.append(await this.objects[sortedObjectKeys[i]].getImgElement());
    }
    
    const sortedCharacterKeys = Object.keys(this.characters)//.sort((key1, key2) => this.characters[key1].z - this.characters[key2].z);
    for (let i = 0; i < sortedCharacterKeys.length; i++) {
      this.rootEl.append(await this.characters[sortedCharacterKeys[i]].getHtmlElement());
    }
  }

  public setImg(assetId: string) {
    this.assetId = assetId;
    
    return this;
  }

  private async getImgElement() {
    this.imgEl = document.createElement('img');
    try {
      this.imgEl.src = await window.PacdkAssetStorage.getAsset(this.assetId, 'gfx');
    }
    catch (error) {
      console.error(`Cant fetch asset "${this.assetId}" for room "${this.id}"`, error)
    }
    this.imgEl.classList.add('room-bg');
    this.imgEl.dataset.objectId = this.id;
    this.imgEl.dataset.assetId = this.assetId;

    return this.imgEl;
  }

  public async addCharacter(character: Character) {
    this.characters[character.id] = character;
    await this.render();
  }

  public async removeCharacter(character: Character) {
    delete this.characters[character.id];
    await this.render();
  }

  protected dispatchLoops() {
    if (this.loop1) {
      clearInterval(this.loop1Interval!);
      this.loop1Interval = setInterval(() => {
        if (this.loop1Running)
          return;
        this.loop1Running = true;
        this.loop1!(this).then(() => {
          this.loop1Running = false;
        });
      }, 1000);
    }

    if (this.loop2) {
      clearInterval(this.loop2Interval!);
      this.loop2Interval = setInterval(() => {
        if (this.loop2Running)
          return;
        this.loop2Running = true;
        this.loop2!(this).then(() => {
          this.loop2Running = false;
        });
      }, 1000);
    }
  }
}
