import AudioPlayerInstance from "./AudioPlayerInstance";

export default class AudioPlayer {
  private musicPlayer?: AudioPlayerInstance
  private sfxPlayers: {[key: string]: AudioPlayerInstance} = {};
  private speechPlayers: {[key: string]: AudioPlayerInstance} = {};
  
  public musicCrossfadeSpeed = 1000;

  private _musicVolume: number = 100;
  public get musicVolume(): number {
    return this._musicVolume;
  }
  public set musicVolume(v: number) {
    this._musicVolume = v;

    if (this.musicPlayer)
      this.musicPlayer.player.volume = v / 100;
  }

  private _speechVolume: number = 100;
  public get speechVolume(): number {
    return this._speechVolume;
  }
  public set speechVolume(v: number) {
    this._speechVolume = v;
  }
  
  private _soundVolume: number = 100;
  public get soundVolume(): number {
    return this._soundVolume;
  }
  public set soundVolume(v: number) {
    this._soundVolume = v;
  }

  public setMusicPlayer(id: string, noloop = false) {
    if (!this.musicPlayer) {
      this.musicPlayer = new AudioPlayerInstance(id, 'music', true);
      this.musicPlayer.player.volume = this._musicVolume / 100;
    }
    else
      this.musicPlayer.id = id;

    this.musicPlayer.player.loop = !noloop;
  }

  public stopMusicPlayer() {
    if (this.musicPlayer) {
      this.musicPlayer.player.pause();
      delete this.musicPlayer;
    }
  }

  public playSound(id: string, volume?: number) {
    return new Promise<void>(async resolve => {
      this.sfxPlayers[id] = new AudioPlayerInstance(id, 'sfx', true);
      this.sfxPlayers[id].player.volume = (volume || this._soundVolume) / 100;
      this.sfxPlayers[id].player.addEventListener('ended', ()=> {
        resolve();
        delete this.sfxPlayers[id];
      });
    });
  }

  public playSpeech(id: string) {
    return new Promise<void>(async resolve => {
      this.speechPlayers[id] = new AudioPlayerInstance(id, 'sfx', true);
      this.speechPlayers[id].player.volume = this._soundVolume / 100;
      this.speechPlayers[id].player.addEventListener('ended', ()=> {
        resolve();
        delete this.speechPlayers[id];
      });
    });
  }

  public playLoopedSound(id: string, volume?: number) {
    this.sfxPlayers[id] = new AudioPlayerInstance(id, 'sfx', true);
    this.sfxPlayers[id].player.volume = (volume || this._soundVolume) / 100;
    this.sfxPlayers[id].player.loop = true;
  }

  public stopSound(id: string) {
    if (this.sfxPlayers[id]) {
      this.sfxPlayers[id].player.pause();
      delete this.sfxPlayers[id];
    }
  }
}
