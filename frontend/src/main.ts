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
  setInterval(() => {
    const date = new Date();
    window.PacdkVariablesModel.hour = date.getHours();
    window.PacdkVariablesModel.minute = date.getMinutes();
    window.PacdkVariablesModel.second = date.getSeconds();
    window.PacdkVariablesModel.day = date.getDate();
    window.PacdkVariablesModel.month = date.getMonth()+1;
    window.PacdkVariablesModel.year = date.getFullYear();
  }, 1000);
  window.PacdkVariablesModel.currentroom = '';
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
