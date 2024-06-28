export default class AudioPlayerInstance {
  public player: HTMLAudioElement;
  private type: string;
  
  private _id!: string;
  public get id(): string {
    return this._id;
  }
  public set id(v: string) {
    this.changeSrc(v);
  }

  constructor(id: string, type: string, autoplay = false) {
    this.player = document.createElement('audio');
    this.type = type;

    if (autoplay)
      this.player.autoplay = true;

    this.id = id;
  }

  public play() {
    return new Promise<void>((resolve) => {
      this.player.addEventListener('ended', () => resolve());
      this.player.play();
    });
  }

  private async changeSrc(id: string) {
    if (this._id === id)
      return;

    this._id = id;
    
    this.player.src = await window.PacdkAssetStorage.getAsset(id, this.type);
    this.player.load();
  }
}
