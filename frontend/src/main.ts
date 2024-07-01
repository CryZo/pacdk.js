import './assets/main.scss';

import PacdkFunctions from './classes/PacdkFunctions';
import AssetStorage from './classes/AssetStorage';
import AudioPlayer from './classes/AudioPlayer';
import GameDataLoader from './classes/GameDataLoader';
import GameUi from './classes/GameUi';
import PacdkHelpers from './classes/PacdkHelpers';

(async () => {
  window.PacdkFunctions = PacdkFunctions;
  window.PacdkVariablesModel = {};
  window.PacdkInternalVariablesModel = {
    FocussedCharacter: 'Ben',
    Font: 0,
    InfoTextColor: '#ffffff',
    OffTextColor: '#ffffff',
    Cursor: '',
    Opacity: 255,
    ScreenChange: 0,
    RunningFunctions: [],

    Startscript: '',
    Givelink: '',
    Linktext: '',
    Walktext: '',
    PixelScale: 1,
    ObjectToRoomMapping: {}
  };
  window.PacdkAssetStorage = new AssetStorage();
  window.PacdkAudioPlayer = new AudioPlayer();
  window.PacdkGameUi = new GameUi();
  window.PacdkHelpers = PacdkHelpers;

  window.addEventListener("contextmenu", e => e.preventDefault());

  await GameDataLoader.loadGameZip();

  // Fill globals
  window.addEventListener('mousemove', e => {
    window.PacdkVariablesModel.mousex = e.clientX;
    window.PacdkVariablesModel.mousey = e.clientY;
  });

  window.PacdkVariablesModel = new Proxy({
    ...window.PacdkVariablesModel,
    ... {
      get hour() {return new Date().getHours()},
      get minute() {return new Date().getMinutes()},
      get second() {return new Date().getSeconds()},
      get day() {return new Date().getDate()},
      get month() {return new Date().getMonth()+1},
      get year() {return new Date().getFullYear()},
      currentroom: '',
      get roomx() {
        PacdkHelpers.getRoom
        const room = PacdkHelpers.getRoom(window.PacdkVariablesModel.currentroom);
        if (room) return room.scrollX;
        return 0;
      },
      get roomy() {
        const room = PacdkHelpers.getRoom(window.PacdkVariablesModel.currentroom);
        if (room) return room.scrollY;
        return 0;
      },
      get roompx() {
        const room = PacdkHelpers.getRoom(window.PacdkVariablesModel.currentroom);
        if (room) return room.scrollXpx;
        return 0;
      },
      get roompy() {
        const room = PacdkHelpers.getRoom(window.PacdkVariablesModel.currentroom);
        if (room) return room.scrollYpx;
        return 0;
      },
      get charx() {
        const char = PacdkHelpers.getCharacter(window.PacdkInternalVariablesModel.FocussedCharacter);
        if (char) return char.x;
        return 0;
      },
      get chary() {
        const char = PacdkHelpers.getCharacter(window.PacdkInternalVariablesModel.FocussedCharacter);
        if (char) return char.y;
        return 0;
      },
      get charzoom() {
        const char = PacdkHelpers.getCharacter(window.PacdkInternalVariablesModel.FocussedCharacter);
        if (char) return char.zoom;
        return 1;
      },
      get actiontext() {
        return window.PacdkGameUi.actiontext();
      },
      empty: '',
      leftbracket: '(',
      rightbracket: ')',
    }
  }, {
    get(target, name, receiver) {
      if (name.toString().startsWith('charx:')) {
        const char = PacdkHelpers.getCharacter(name.toString().replace('charx:', ''))
        if (char) return char.x;
        return 0;
      }
      if (name.toString().startsWith('chary:')) {
        const char = PacdkHelpers.getCharacter(name.toString().replace('chary:', ''))
        if (char) return char.y;
        return 0;
      }
      if (name.toString().startsWith('charzoom:')) {
        const char = PacdkHelpers.getCharacter(name.toString().replace('charzoom:', ''))
        if (char) return char.zoom;
        return 1;
      }
      if (name.toString().startsWith('obj:')) {
        const obj = PacdkHelpers.getObject(name.toString().replace('obj:', ''))
        if (obj) return obj.state;
        return 0;
      }
      if (name.toString().startsWith('objx:')) {
        const obj = PacdkHelpers.getObject(name.toString().replace('objx:', ''))
        if (obj) return obj.x;
        return 0;
      }
      if (name.toString().startsWith('objy:')) {
        const obj = PacdkHelpers.getObject(name.toString().replace('objy:', ''))
        if (obj) return obj.y;
        return 0;
      }

      return Reflect.get(target, name, receiver);
    }
  });
})();


window.PacdkRun = () => {
  if (window.PacdkFunctionModel.Cutscene && window.PacdkFunctionModel.Cutscene[window.PacdkInternalVariablesModel.Startscript])
    window.PacdkFunctionModel.Cutscene[window.PacdkInternalVariablesModel.Startscript](new EventTarget());
};

// TODO functions fixen
// @ts-ignore
window.fade = 0;
// @ts-ignore
window.blend = 1;
// @ts-ignore
window.wait = false;
// @ts-ignore
window.dontwait = true;
