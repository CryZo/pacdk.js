import { unzip } from "unzipit";
import type { TFunctionTypes, TInternalVariablesModel } from "../types";
import Character from "./Character";
import ScriptParser from "./ScriptParser";
import Room from "./Room";
import Object from "./Object";
import PacdkHelpers from "./PacdkHelpers";

export default class GameDataLoader {
  public static async loadGameZip() {
    const {entries} = await unzip(`${import.meta.env.VITE_DATA_URI}/game.dat`);

    const txt = async (filename: string) => this.fixWindowsEncodings(await entries[filename].arrayBuffer());

    const game2 = await txt('game.002');

    await this.loadProjectData(await txt('game.001'));
    await this.loadScripts(await txt('game.003'));
    await this.assignGraphics(game2);
    await this.assignObjectPosition(game2);
    await this.loadCharacters(game2);
    await this.assignCharactersToRooms(game2);
    await this.assignRoomValues(game2);
  }

  private static async loadProjectData(text: string) {
    const lines = text.split("\n");
    let commandMode: false | 'key' | 'label' = false;
    let commandKey = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const oneLineSetting = (key: string, modelkey?: keyof TInternalVariablesModel) => {
        if (!modelkey)
          modelkey = key as any;
        
        if (line.includes(key)) {
          //@ts-ignore
          window.PacdkInternalVariablesModel[modelkey] = line.split(':')[1].trim();
          return true;
        }
        return false;
      }

      if (line.includes(':'))
        commandMode = false;

      if (commandMode === 'key') {
        commandKey = line;
        commandMode = 'label';
        continue;
      }

      if (commandMode === 'label') {
        window.PacdkGameUi.addCommand(commandKey, line);
        commandMode = 'key';
        continue;
      }
      
      if (oneLineSetting('Startskript', 'Startscript')) continue;
      if (oneLineSetting('Linktext')) continue;
      if (oneLineSetting('Givelink')) continue;
      if (oneLineSetting('Walktext')) continue;

      if (line === 'Commands :') {
        commandMode = 'key';
        continue;
      }
    }
  }
  
  private static async loadScripts(text: string) {
    window.PacdkFunctionModel = {}
    const matches = text.matchAll(/^\/\/(?<type>\S+) (?<name>.+)\n(?<body>(?:(?!\/\/).|\n)*)/gm);
    for (const m of matches) {
      const match = m as unknown as {groups: {type: TFunctionTypes, name: string, body: string}};
      const id = PacdkHelpers.nameToId(match.groups.name);

      if (!window.PacdkFunctionModel[match.groups.type])
        window.PacdkFunctionModel[match.groups.type] = {};
        
      try {
        switch (match.groups.type) {
          case 'Character':
            window.PacdkFunctionModel[match.groups.type]![id] = new Character(match.groups.name, ScriptParser.parse(match.groups.body));
            break;
            
          case 'Room':
            window.PacdkFunctionModel[match.groups.type]![id] = new Room(match.groups.name, ScriptParser.parse(match.groups.body));
            break;

          case 'Object':
            const parts = match.groups.name.split(';').map(part => part.trim());
            const id0 = PacdkHelpers.nameToId(parts[0]);
            const id1 = PacdkHelpers.nameToId(parts[1]);

            if (!window.PacdkFunctionModel[match.groups.type]![id1])
              window.PacdkFunctionModel[match.groups.type]![id1] = {};

            window.PacdkInternalVariablesModel.ObjectToRoomMapping[id0] = id1;

            window.PacdkFunctionModel.Room![id1].objects[id0] = new Object(parts[0], ScriptParser.parse(match.groups.body));
            break;
        
          default:
            window.PacdkFunctionModel[match.groups.type]![id] = ScriptParser.parse(match.groups.body);
            break;
        }
      }
      catch (error) {
        console.error(`Failed to initialize ${match.groups.type} "${match.groups.name}":`, error)
      }
    }
  }

  private static async assignGraphics(text: string) {
    const matches = text.matchAll(/^\/\/(?<type>\S+) (?<name>.+)\n[\n\d;-]*(?<assetId>[\wäöüÄÖÜß][\wäöüÄÖÜß\d]+).*/gm);
    for (const m of matches) {
      const match = m as unknown as {groups: {type: TFunctionTypes, name: string, assetId: string}};
      const id = PacdkHelpers.nameToId(match.groups.name);

      switch (match.groups.type) {
        case 'Object':
          if (window.PacdkFunctionModel.Room && window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]] && window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]].objects[id] && isNaN(parseInt(match.groups.assetId)))
            window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]].objects[id].setImg(match.groups.assetId);
          else
            console.error(`Unable to set asset id "${match.groups.assetId}" to object "${match.groups.name}" in room "${window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]}"`);
          break;
          
        case 'Room':
          if (window.PacdkFunctionModel.Room && window.PacdkFunctionModel.Room[id] && !['', '00'].includes(match.groups.assetId))
            window.PacdkFunctionModel.Room[id].setImg(match.groups.assetId);
          else
            console.error(`Unable to set asset id "${match.groups.assetId}" to room "${match.groups.name}"`);
          break;
      
        default:
          break;
      }
    }
  }

  private static async assignObjectPosition(text: string) {
    const matches = text.matchAll(/^;;Roomobject (?<name>.+)\n.*\n(?<x>\d+)\n(?<y>\d+)\n.*\n.*\n(?<z>\d+)/gm);
    for (const m of matches) {
      const match = m as unknown as {groups: {name: string, x: string, y: string, z: string}};
      const id = PacdkHelpers.nameToId(match.groups.name);

      if (window.PacdkFunctionModel.Room && window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]] && window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]].objects[id])
        window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]].objects[id].setPos(parseInt(match.groups.x), parseInt(match.groups.y), parseInt(match.groups.z));
      else
        console.error(`Unable to set position for object "${match.groups.name}" in room "${window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]}"`);
    }
  }
  
  private static async loadCharacters(text: string) {
    const outerMatches = text.matchAll(/^\/\/(?<type>\S+) (?<name>.+)\n(?<body>(?:(?!\/\/).|\n)*)/gm);
    for (const m of outerMatches) {
      const outerMatch = m as unknown as {groups: {type: TFunctionTypes, name: string, body: string}};
      const id = PacdkHelpers.nameToId(outerMatch.groups.name);

      if (outerMatch.groups.type !== 'Character')
        continue;

      if (!window.PacdkFunctionModel.Character || !window.PacdkFunctionModel.Character[id]) {
        console.error(`Unable to add assets to character "${outerMatch.groups.name}": Character not found!`);
        continue;
      }

      const char = window.PacdkFunctionModel.Character[id];

      const matches = outerMatch.groups.body.matchAll(/(?:\n|.(?!;\n))+.;$/gm);
      let first = true;
      let frame = 0;
      let animCount = 0
      let curAnim: Character['actions'][0] = [];
      for (const match of matches) {
        const lines = match[0].split("\n");

        if (first) {
          char.walksound = lines[6];
          char.actionIds = lines[7].split(';');
          first = false;
          if (lines.length <= 8)
            continue;
        }

        const getNum = (i: number, cb: (val: number) => void) => {
          if (lines.length >= i+1 && !isNaN(parseInt(lines[lines.length - i])))
            cb(parseInt(lines[lines.length - i]));
        }
        
        // getNum(8, v => headX = v);
        // getNum(6, v => headY = v);

        /**
         * Nummern:
         * ?
         * ?
         * Gesamtbreite
         * Gesamthöhe
         * Fußpunkt X
         * Fußpunkt Y
         */

        const magicNumbers = lines[lines.length-1].split(';').map(v=>parseInt(v));
  
        let curFrame: typeof curAnim[0] = {
          headX: magicNumbers[2],
          headY: magicNumbers[3],
          bodyX: magicNumbers[0],
          bodyY: magicNumbers[1],
          width: 0,
          height: 0,
          footX: 0,
          footY: 0
        };

        getNum(7, v => curFrame.width = v);
        getNum(6, v => curFrame.height = v);
        getNum(5, v => curFrame.footX = v);
        getNum(4, v => curFrame.footY = v);

        if (lines.length >= 4)
          curFrame.bodyAsset = lines[lines.length - 3];

        if (lines.length >= 3)
          curFrame.headAsset = lines[lines.length - 2];

        if (curFrame.bodyAsset || curFrame.headAsset)
          curAnim.push(curFrame);

        if (frame === 29) {
          if (curAnim.length) {
            if (animCount < Character.defaultActionKeys.length)
              char.defaultActions[Character.defaultActionKeys[animCount]] = curAnim;
            else
              char.actions.push(curAnim);
          }

          animCount++;
          frame = 0;
          curAnim = [];
          continue;
        }

        frame++;
      }
    }
  }

  private static async assignCharactersToRooms(text: string) {
    const matches = text.matchAll(/^\/\/Rcharacter (?<name>.+)\n(?<body>(?:(?!\/\/).|\n)*)/gm);
    for (const m of matches) {
      const match = m as unknown as {groups: {name: string, body: string}};
      const lines = match.groups.body.split("\n");
      const roomId = PacdkHelpers.nameToId(lines[1]);
      const char = PacdkHelpers.getCharacter(match.groups.name);
      if (!char) {
        console.error(`Unable to assign character "${match.groups.name}" to room "${roomId}": Character not found!`);
        continue;
      }

      char.room = roomId;
      char.setPos(parseInt(lines[2]), parseInt(lines[3]));
      char.direction = parseInt(lines[4]) as 1|2|3|4;
    }
  }

  private static async assignRoomValues(text: string) {
    const matches = text.matchAll(/^\/\/Room (?<name>.+)\n(?<body>(?:(?!\/\/).|\n)*)/gm);
    for (const m of matches) {
      const match = m as RegExpExecArray & {groups: {name: string, body: string}};
      const roomId = PacdkHelpers.nameToId(match.groups.name);
      const lines = match.groups.body.split("\n");
      const room = PacdkHelpers.getRoom(match.groups.name);
      if (!room) {
        console.error(`Unable to assign values to room "${roomId}": Room not found!`);
        continue;
      }

      room.width = parseInt(lines[0]);
      room.height = parseInt(lines[1]);
      room.topOffset = parseInt(lines[4]);
      room.bottomOffset = parseInt(lines[5]);

      room.walkmapSize = lines[9] === '0' ? 20 : 10;
    }
  }
  

  private static fixWindowsEncodings(input: ArrayBuffer): string {
    const dec = new TextDecoder("windows-1252")
    const ui8array = new Uint8Array(input)
    const text = dec.decode(ui8array)

    return text.replace(/\r\n/g, "\n");
  };
}
