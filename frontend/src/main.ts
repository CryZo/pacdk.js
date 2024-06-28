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
    CurrentRoom: '',

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
})();


window.PacdkRun = () => {
  if (window.PacdkFunctionModel.Cutscene && window.PacdkFunctionModel.Cutscene[window.PacdkInternalVariablesModel.Startscript])
    window.PacdkFunctionModel.Cutscene[window.PacdkInternalVariablesModel.Startscript](new EventTarget());
};

// TODO functions fixen
// @ts-ignore
window.fade = 0;
