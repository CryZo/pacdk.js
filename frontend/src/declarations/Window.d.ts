import AssetStorage from '../classes/AssetStorage';
import AudioPlayer from '../classes/AudioPlayer';
import GameUi from '../classes/GameUi';
import type PacdkFunctions from '../classes/PacdkFunctions';
import { TFunctionModel, TVariablesModel, TInternalVariablesModel } from '../types';

declare global {
  interface Window {
    PacdkFunctions: PacdkFunctions;
    PacdkFunctionModel: TFunctionModel;
    PacdkVariablesModel: TVariablesModel;
    PacdkInternalVariablesModel: TInternalVariablesModel;
    PacdkAssetStorage: AssetStorage;
    PacdkAudioPlayer: AudioPlayer;
    PacdkGameUi: GameUi;
    PacdkHelpers: PacdkHelpers;

    PacdkRun: () => void
  }  
}
