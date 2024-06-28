type TInternalVariablesModel = {
  FocussedCharacter: string;
  Font: number;
  InfoTextColor: string;
  OffTextColor: string;
  Cursor: string;
  Opacity: number;
  /**
   * 0 - Direct
   * 1 - Fadeblack
   * 2 - Rectangle
   * 3 - Circle
   * 4 - Shutters
   * 5 - Clock
   * 6 - Blend
   * 7 - Blendslow
   */
  ScreenChange: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  RunningFunctions: string[];
  CurrentRoom: string;

  Startscript: string;
  Linktext: string;
  Givelink: string;
  Walktext: string;
  PixelScale: number;
  ObjectToRoomMapping: Record<string, string>;
};

export default TInternalVariablesModel;
