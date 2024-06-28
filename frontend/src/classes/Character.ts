import PacdkFunctions from "./PacdkFunctions";
import PacdkHelpers from "./PacdkHelpers";
import Room from "./Room";
import ScriptTarget from "./ScriptTarget";

export default class Character extends ScriptTarget {
  public id: string;
  public script: (context: EventTarget)=> Promise<void>;

  private rootEl?: HTMLElement;
  private headImg?: HTMLImageElement;
  private bodyImg?: HTMLImageElement;
  
  private _inventory : string[] = [];
  public get inventory() : string[] {
    return this._inventory;
  }
  public set inventory(v : string[]) {
    this._inventory = v;
  }

  private headX = 0;
  private headY = 0;
  private bodyX = 0;
  private bodyY = 0;
  private footX = 0;
  private footY = 0;
  
  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  private fromWalkmapCoords: boolean = false;

  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }
  public get z(): number {
    return this._z;
  }

  public height: number = 0;
  public width: number = 0;

  
  private _direction: 1|2|3|4 = 1;
  public get direction(): 1|2|3|4 {
    return this._direction;
  }
  public set direction(v: 1|2|3|4) {
    this._direction = v;
    this.updateFullMode();
  }
  

  private headAsset: string = '';
  private bodyAsset: string = '';

  public static defaultActionKeys = ['standfront', 'standback', 'standside', 'walkfront', 'walkback', 'walkside', 'talkstandfront', 'talkstandback', 'talkstandside', 'talkwalkfront', 'talkwalkback', 'talkwalkside', 'idle', 'unknown', 'pickupfront', 'pickupside'] as const;
  public defaultActions: {[key in 'standfront'|'standback'|'standside'|'walkfront'|'walkback'|'walkside'|'talkstandfront'|'talkstandback'|'talkstandside'|'talkwalkfront'|'talkwalkback'|'talkwalkside'|'idle'|'unknown'|'pickupfront'|'pickupside']: typeof this.actions[0]} = {} as any;
  public actions: {headAsset?: string, bodyAsset?: string, headX: number, headY: number, bodyX: number, bodyY: number, footX: number, footY: number, width: number, height: number}[][] = [];
  public actionIds: string[] = [];
  public walksound: string = '';

  private curAction: number | null = null;
  private curActionFrame: number | null = null;
  private actionQueue: number[] = [];

  public font: number = 0;

  private _room: string = '';
  public get room(): string {
    return this._room;
  }
  public set room(v: string) {
    this.setRoom(v);
  }

  private roomInstance: Room | null = null;
  
  private _fullMode: keyof typeof this.defaultActions = 'standfront';
  private get fullMode(): keyof typeof this.defaultActions {
    return this._fullMode;
  }
  private set fullMode(v: keyof typeof this.defaultActions) {
    if (this.defaultActions[v] && this.defaultActions[v].length) {
      this.headAsset = this.defaultActions[v][0].headAsset ?? '';
      this.bodyAsset = this.defaultActions[v][0].bodyAsset ?? '';
      this.headX = this.defaultActions[v][0].headX;
      this.headY = this.defaultActions[v][0].headY;
      this.bodyX = this.defaultActions[v][0].bodyX;
      this.bodyY = this.defaultActions[v][0].bodyY;

      if (this.defaultActions[v][0].footX !== undefined)
        this.footX = this.defaultActions[v][0].footX!;

      if (this.defaultActions[v][0].footY !== undefined)
        this.footY = this.defaultActions[v][0].footY!;
    }
    this._fullMode = v;
    this.render();
  }

  private mirrored: boolean = false;
  private modeFrameIndex: number = 0;

  private _mode: 'stand' | 'walk' | 'talkstand' | 'talkwalk' | 'idle' | 'pickup' = 'stand';
  public get mode(): typeof this._mode {
    return this._mode;
  }
  public set mode(v: typeof this._mode) {
    this._mode = v;
    this.updateFullMode();
  }

  private updateFullMode() {
    let dir = '';
    switch (this.direction) {
      case 1:
        dir = 'front';
        this.mirrored = false;
        break;

      case 2:
        dir = 'back';
        this.mirrored = false;
        break;

      case 3:
        dir = 'side';
        this.mirrored = false;
        break;

      case 4:
        dir = 'side';
        this.mirrored = true;
        break;
    }

    this.modeFrameIndex = 0;
    if (this.mode !== 'idle') {
      return this.fullMode = `${this.mode}${dir}` as keyof typeof this.defaultActions;
    }

    this.fullMode = 'idle';
  }
  
  
  private get roomTopOffset(): number {
    if (!this.roomInstance)
      return 0;

    return this.roomInstance.topOffsetPx;
  }


  constructor(id: string, script: (context: EventTarget)=> Promise<void>) {
    super();

    for (let i = 0; i < Character.defaultActionKeys.length; i++) {
      const key = Character.defaultActionKeys[i];
      this.defaultActions[key] = [];
    }

    this.id = id;
    this.script = script.bind(this);
    this.script(this);
  }

  public async speech(text: string, audioId?: string) {
    console.log(`%c${this.id}: ${text}`, 'color: red; font-family: Comic Sans MS; font-size: 1.25rem; font-weight: 900;');

    const oldMode = this.mode;
    if (this.mode === 'walk')
      this.mode = 'talkwalk';
    else
      this.mode = 'talkstand';
    if (audioId)
      await window.PacdkAudioPlayer.playSpeech(audioId);
    else
      await PacdkFunctions.wait(text.length * 20 / 1000);

    this.mode = oldMode;
  }

  public queueActions(...actions: (number | string)[]) {
    this.actionQueue = [...this.actionQueue, ...actions.map(a => {
      if (typeof a === 'number')
        return a;

      return this.actionIds.indexOf(a);
    })];
  }

  public hasItem(id: string): boolean {
    return this._inventory.includes(id);
  }
  

  public setPos(x: number, y: number, z?: number) {
    this.fromWalkmapCoords = false;
    this._x = x;
    this._y = y;

    if (z)
      this._z = z;
    
    this.applyPos();

    return this;
  }

  public setWalkmapPos(x: number, y: number) {
    this.fromWalkmapCoords = true;
    if (this.roomInstance) {
      this._x = x * this.roomInstance.walkmapSize;
      this._y = y * this.roomInstance.walkmapSize;
      
      this.applyPos();
  
      return this;
    }

    this.setPos(x, y);
    return this;
  }

  private applyPos() {
    if (this.rootEl) {
      const scale = window.PacdkInternalVariablesModel.PixelScale;
      let topOffset = 0;
      if (!this.fromWalkmapCoords)
        topOffset = this.roomTopOffset;

      this.rootEl.style.top = (topOffset + this.y - this.footY) * scale + 'px';
      this.rootEl.style.left = (this.x - this.footX) * scale + 'px';

      this.rootEl.style.height = this.height * scale + 'px';
      this.rootEl.style.width = this.width * scale + 'px';
      const r = this.roomInstance;
      if (r) {
        const topSectionHeight = (r.height / 24 * r.topOffset);
        const sectionHeight = (r.height / 24 * r.bottomOffset) - topSectionHeight;
        const pos = this._y;
        let scale = pos/sectionHeight / 2 + .5;
        // console.log({id: this.id, scale});
        if (scale < .5)
          scale = .5;
        if (scale > 1)
          scale = 1;

        const scaleY = scale;
        let scaleX = scale

        if (this.mirrored)
          scaleX *= -1;
        this.rootEl.style.transform = `scale(${scaleX}, ${scaleY})`;
      }
    }

    return this;
  }

  public async getHtmlElement() {
    if (!this.rootEl) {
      this.rootEl = document.createElement('div');
      this.rootEl.classList.add('character');
      this.rootEl.dataset.characterId = this.id;
      this.applyPos();
      
      PacdkHelpers.addMouseEvents(this, this.rootEl);
    }
    
    await this.render();
    return this.rootEl;
  }

  private async render() {
    if (!this.rootEl)
      return;

    this.rootEl.innerHTML = ' ';
    
    this.headImg = document.createElement('img');
    this.headImg.classList.add('head')

    this.bodyImg = document.createElement('img');
    this.bodyImg.classList.add('body')

    this.rootEl.append(this.bodyImg);
    this.rootEl.append(this.headImg);

    await this.applyAssets();
  }

  private async applyAssets() {
    if (!this.rootEl)
      return;

    const scale = window.PacdkInternalVariablesModel.PixelScale;

    const applyImg = async (asset: string, el: HTMLImageElement | undefined, is: 'head' | 'body') => {
      if (el) {
        switch (is) {
          case 'head':
            el.style.left = `${this.headX * scale}px`;
            el.style.top = `${this.headY * scale}px`;
            break;

          case 'body':
            el.style.left = `${this.bodyX * scale}px`;
            el.style.top = `${this.bodyY * scale}px`;
            break;
        }

        if (el.dataset.assetId === asset)
          return;

        try {
          el.src = await window.PacdkAssetStorage.getAsset(asset, 'gfx');
          el.dataset.assetId = asset;
        }
        catch (error) {
          console.error(`Cant fetch asset "${asset}" for character "${this.id}"`, error)
        }
      }
    }

    await Promise.all([
      applyImg(this.headAsset, this.headImg, 'head'),
      applyImg(this.bodyAsset, this.bodyImg, 'body')
    ]);

    this.applyPos();
  }


  private setRoom(room: string) {
    if (this.roomInstance)
      this.roomInstance.removeCharacter(this);

    this.roomInstance = PacdkHelpers.getRoom(room);
    this._room = PacdkHelpers.nameToId(room);;
    
    if (this.roomInstance)
      this.roomInstance.addCharacter(this);

    this.direction = 1;
    this.mode = 'stand';
  }

  public async renderAnimationFrame() {
    if (this.curAction === null) {
      if (this.actionQueue.length) {
        this.curAction = this.actionQueue.splice(0, 1)[0];
        this.curActionFrame = 0;
      }
    }

    if (this.curAction !== null && this.curActionFrame !== null && this.actions[this.curAction] && this.actions[this.curAction][this.curActionFrame]) {
      const frame = this.actions[this.curAction][this.curActionFrame];
      this.curActionFrame++;

      if (frame)
        this.applyFrameData(frame);
    }
    else {
      this.curAction = null;
      this.curActionFrame = null;

      if (!this.defaultActions[this.fullMode] || this.defaultActions[this.fullMode].length === 0)
        return;

      if (this.modeFrameIndex >= this.defaultActions[this.fullMode].length)
        this.modeFrameIndex = 0;

      const frame = this.defaultActions[this.fullMode][this.modeFrameIndex++];
      if (frame)
        this.applyFrameData(frame);
    }

    await this.applyAssets();
  }

  private applyFrameData(frame: typeof this.actions[0][0]) {
    this.headAsset = frame.headAsset ?? '';
    this.bodyAsset = frame.bodyAsset ?? '';
    this.headX = frame.headX;
    this.headY = frame.headY;
    this.bodyX = frame.bodyX;
    this.bodyY = frame.bodyY;
    if (frame.width)
      this.width = frame.width;
    if (frame.height)
      this.height = frame.height;
    if (frame.footX)
      this.footX = frame.footX;
    if (frame.footY)
      this.footY = frame.footY;
  }
}
