import { TInternalVariablesModel } from "../types";
import PacdkHelpers from "./PacdkHelpers";

export default class PacdkFunctions {
  public static showinfo(text: string, showAtCursor: boolean = false) {
    window.PacdkGameUi.infoText = text;
    window.PacdkGameUi.infoTextVisibleOnPointer = showAtCursor;
  }
  
  public static minicut(donthide: boolean = false) {
    console.log('minicut', {donthide});
  }
  
  public static wait(duration: number | string) {
    if (typeof duration === 'string')
      duration = parseInt(duration);

    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), duration * 1000);
    });
  }
  
  public static async function(id: string, repetitions: string) {
    let r = 1
    const parsed = parseInt(repetitions);
    if (['*', 'inf', 'infinitly'].includes(repetitions))
      r = -1
    else if (!isNaN(parsed))
      r = parsed;

    let counter = 0
    while (window.PacdkInternalVariablesModel.RunningFunctions.includes(id) && counter < r) {
      await window.PacdkFunctionModel.Cutscene![id](new EventTarget());
      counter++
    }
  }
  
  public static async cutscene(id: string) {
    await window.PacdkFunctionModel.Cutscene![id](new EventTarget());
  }

  //#region Variables
  public static setbool(key: string, value: boolean) {
    window.PacdkVariablesModel[key] = !!value;
  }

  public static setfocus(character: string) {
    window.PacdkInternalVariablesModel.FocussedCharacter = character;
  }

  public static setfont(font: number, character: string) {
    if (character) {
      const c = PacdkHelpers.getCharacter(character);
      if (!c)
        return;

      c.font = font;
      return;
    }
    
    window.PacdkInternalVariablesModel.Font = font;
  }

  public static infotextcolor(red: number, green: number, blue: number) {
    window.PacdkInternalVariablesModel.InfoTextColor = '#' + red.toString(16) + green.toString(16) + blue.toString(16);
  }

  public static instmouse(cursor: string) {
    window.PacdkInternalVariablesModel.Cursor = cursor;
  }

  public static loadnum(key: string) {
    window.PacdkVariablesModel[key] = parseInt(localStorage.getItem(`globalsave_${key}`) ?? '0');
  }

  public static loadstring(key: string) {
    window.PacdkVariablesModel[key] = localStorage.getItem(`globalsave_${key}`) ?? 'none';
  }

  public static offtextcolor(red: number, green: number, blue: number) {
    window.PacdkInternalVariablesModel.OffTextColor = '#' + red.toString(16) + green.toString(16) + blue.toString(16);
  }

  public static randomnum(key: string, max: number) {
    window.PacdkVariablesModel[key] = Math.floor(Math.random()*max)+1;
  }
  
  public static savenum(key: number) {
    this.savestring(key.toString())
  }
  
  public static savestring(key: string) {
    localStorage.setItem(`globalsave_${key}`, window.PacdkVariablesModel[key])
  }
  
  public static set_rect_walkmap(room: string, x1: number, y1: number, x2: number, y2: number, isWalkable: boolean) {
    console.log('set_rect_walkmap', {room, x1, y1, x2, y2, isWalkable})
  }
  
  public static setnum(key: string, value: number | string) {
    if (typeof value === 'string') {
      if (isNaN(parseInt(value.substring(0, 1)))) {
        const val = parseInt(value.substring(1));
        switch (value.substring(0, 1)) {
          case '*':
            return window.PacdkVariablesModel[key] *= val

          case '/':
            return window.PacdkVariablesModel[key] /= val

          case '+':
            return window.PacdkVariablesModel[key] += val

          case '-':
            return window.PacdkVariablesModel[key] -= val
        
          default:
            console.error(`Can't set num "${key}": Invalid value "${value}"`);
            return;
        }
      } 
    }

    window.PacdkVariablesModel[key] = value;
  }
  
  public static setscreenchange(style: TInternalVariablesModel['ScreenChange']) {
    window.PacdkInternalVariablesModel.ScreenChange = style;
  }
  
  public static setstring(key: string, value: string) {
    window.PacdkVariablesModel[key] = value;
  }

  public static settransparency(value: number) {
    window.PacdkInternalVariablesModel.Opacity = value;
  }
  
  public static setwalkmap(room: string, x: number, y: number, isWalkable: boolean) {
    console.log('set_rect_walkmap', {room, x, y, isWalkable})
  }
  
  public static sqrt(key: string) {
    window.PacdkVariablesModel[key] = Math.sqrt(window.PacdkVariablesModel[key]);
  }
  
  public static arcsin(key: string) {
    window.PacdkVariablesModel[key] = Math.sin(window.PacdkVariablesModel[key]);
  }
  
  public static async downloadstring(url: string, key: string) {
    const res = await fetch(url);
    const txt = await res.text();
    window.PacdkVariablesModel[key] = txt;
  }
  //#endregion

  //#region Sound & video
  public static musicvolume(value: number) {
    window.PacdkAudioPlayer.musicVolume = value;
  }
  
  public static playmusic(id: string, noloop?: boolean | number, _position?: number) {
    if (typeof noloop === 'number') {
      _position = noloop;
      noloop = false;
    }

    window.PacdkAudioPlayer.setMusicPlayer(id, noloop);
  }
  
  public static playsound(id: string, volume?: number, _effect?: string) {
    window.PacdkAudioPlayer.playSound(id, volume);
  }
  
  public static stopmusic() {
    window.PacdkAudioPlayer.stopMusicPlayer();
  }
  
  public static stopsound(id: string) {
    window.PacdkAudioPlayer.stopSound(id);
  }
  
  public static fadespeed(value: number | string) {
    window.PacdkAudioPlayer.musicCrossfadeSpeed = parseInt(value.toString());
  }
  
  public static loopsound(id: string, volume?: number, _effect?: string) {
    window.PacdkAudioPlayer.playLoopedSound(id, volume);
  }
  
  public static loopstop(id: string) {
    console.log('loopstop', {id});
  }
  
  public static async playvideo(id: string, wait: boolean) {
    console.log('playvideo', {id, wait});
  }

  public static speechvolume(value: number) {
    window.PacdkAudioPlayer.speechVolume = value;
  }

  public static soundvolume(value: number) {
    window.PacdkAudioPlayer.soundVolume = value;
  }
  
  public static stopvideo() {
    console.log('stopvideo');
  }
  
  public static setdsp(id: string) {
    console.log('setdsp', {id});
  }
  
  public static async extractsound(id: string) {
    console.log('extractsound', {id});
  }
  
  public static async playanimation(prefix: string, fps: number, x: number, y: number, width: number, height: number, wait = false) {
    console.log('playanimation', {prefix, fps, x, y, width, height, wait});
  }
  
  public static stopanimation() {
    console.log('stopanimation');
  }
  //#endregion

  //#region Objects
  public static setobj(id: string, ...state: number[]) {
    console.log('setobj', {id, state});
  }
  
  public static group(id: string, ...objectIds: string[]) {
    console.log('group', {id, objectIds});
  }
  
  public static instobj(id: string, state: number) {
    console.log('instobj', {id, state});
  }
  
  public static async moveobj(id: string, x: number, y: number, speed: string, wait = false, smooth = 20) {
    console.log('moveobj', {id, x, y, speed, wait, smooth});
  }
  
  public static setobjlight(id: string, red: number, green: number, blue: number, speed?: number) {
    console.log('setobjlight', {id, red, green, blue, speed});
  }
  
  public static setobjalpha(id: string, alpha: number, speed: number) {
    console.log('setobjalpha', {id, alpha, speed});
  }
  
  public static transformobj(id: string, type: 'rotate' | 'scale' | 'skew', param1: number, param2: number, speed?: number, smooth = 20, param3?: string) {
    console.log('transformobj', {id, type, param1, param2, speed, smooth, param3});
  }
  //#endregion

  //#region Rooms
  public static jiggle(time: number, strength: number) {
    console.log('jiggle', {time, strength});
  }
  
  public static loadroom(id: string, _transition: TInternalVariablesModel['ScreenChange']) {
    const room = PacdkHelpers.getRoom(id);
    if (room)
      room.enter();
  }
  
  public static return() {
    console.log('return');
  }
  
  public static setpos(id: string, x: number, y: number, jump: boolean, moveover?: 'up' | 'down' | 'left' | 'right') {
    console.log('setpos', {id, x, y, jump, moveover});
  }
  
  public static subroom(id: string, time?: number) {
    console.log('subroom', {id, time});
  }
  
  public static unloadroom() {
    console.log('unloadroom');
  }
  
  public static scrollspeed(speed: number) {
    console.log('scrollspeed', {speed});
  }
  
  public static setlight(id: string, red: number, green: number, blue: number, speed?: number) {
    console.log('setlight', {id, red, green, blue, speed});
  }
  
  public static unloadsub(id: string) {
    console.log('unloadsub', {id});
  }
  //#endregion

  //#region Characters
  public static beamto(character: string, room: string, x: number, y: number, direction: 1|2|3|4 = 1) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    c.room = room;
    c.setWalkmapPos(x, y);
    c.direction = direction;
  }
  
  public static async follow(chaser: string, target: string, dontwait: 'dontwait' | '' = '') {
    console.log('follow', {chaser, target, dontwait});
  }
  
  public static lookto(character: string, directionOrTarget: 1|2|3|4 | string) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    if (typeof directionOrTarget === 'number' || !isNaN(parseInt(directionOrTarget)))
      c.direction = parseInt(directionOrTarget as string) as 1|2|3|4;

    // TODO handle character target
  }
  
  public static async offspeech(x: number, y: number, text: string, assetId?: string, effect?: string, dontwait?: boolean) {
    console.log(`%cOff speech: ${text}`, 'color: yellow; font-family: Comic Sans MS; font-size: 1.25rem; font-weight: 900;');

    if (assetId)
      await window.PacdkAudioPlayer.playSpeech(assetId);

    console.log('offspeech', {x, y, text, assetId, effect, dontwait});
  }
  
  public static pickup(character: string) {
    console.log('pickup', {character});
  }
  
  public static setchar(character: string, ...actions: (number | string)[]) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    c.queueActions(...actions.map(a => {
      if (typeof a === 'string') {
        const parsed = parseInt(a);
        if (!isNaN(parsed))
          return parsed-1;
      }

      return a;
    }));
  }
  
  public static async speech(character: string, text: string, audioId?: string) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    await c.speech(text, audioId);
  }
  
  public static async walkto(character: string, x: number, y: number, direction: 1|2|3|4 = 1, _dontwait: 'dontwait' | '' = '', _reverse: boolean = false) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    c.setWalkmapPos(x, y);
    c.direction = direction;
  }
  
  public static charzoom(character: string, size: number, speed: number) {
    console.log('charzoom', {character, size, speed});
  }
  
  public static linkchar(character: string, object: string) {
    console.log('linkchar', {character, object});
  }
  
  public static offalign(align: string) {
    console.log('offalign', {align});
  }
  
  public static runspeed(speed: number) {
    console.log('runspeed', {speed});
  }
  
  public static async runto(character: string, x: number, y: number, direction: 1|2|3|4 = 1, _dontwait: 'dontwait' | '' = '') {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    c.setWalkmapPos(x, y);
    c.direction = direction;
  }
  
  public static async setcharalpha(character: string, alpha: number, speed: number) {
    console.log('setcharalpha', {character, alpha, speed});
  }
  
  public static async setcharlight(character: string, red: number, green: number, blue: number, speed?: number) {
    console.log('setcharlight', {character, red, green, blue, speed});
  }
  
  public static setwalksound(character: string, audioId: string) {
    const c = PacdkHelpers.getCharacter(character);
    if (!c)
      return;

    c.walksound = audioId;
  }
  
  public static stepto(character: string, direction: 1|2|3|4) {
    console.log('stepto', {character, direction});
  }
  
  public static stopzooming(character: string, value: boolean) {
    console.log('stopzooming', {character, value});
  }
  
  public static switchchar(character1: string, character2: string) {
    console.log('switchchar', {character1, character2});
  }
  
  public static unlinkchar(character: string) {
    console.log('unlinkchar', {character});
  }
  
  public static loadchar(character: string) {
    console.log('loadchar', {character});
  }
  //#endregion
}
