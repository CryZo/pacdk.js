export default class ScriptParser {
  public static parse(input: string): (context: EventTarget) => Promise<void> {
    const script = `async context=>{await (${this.parseMultiLine(input)})()}`;
    try {
      return eval(script);
    }
    catch (error) {
      throw new Error(`Invalid script! ${error}\n\n${script}`);
    }
  }
  
  public static parseMultiLine(input: string, addLoopCheck = false): string {
    const lines = input.replace(/(\))( *)(\w)/g, "$1\n$3").split("\n");

    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
      if (lines[i] === '')
        lines.splice(i--, 1);
    }
    
    let ret = "\n";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.startsWith('if') && !line.startsWith('on')) {
        ret += this.parseSingleLine(line, addLoopCheck) + "\n";
      }
      else {
        const paramsMatch = line.match(/\((?<params>.+)\)/);
        let params: string[] = [];
        if (paramsMatch)
          params = paramsMatch!.groups!.params.split(';').map(param => this.sanitizeString(param));

        const {callback, nextLine} = this.parseCodeBlock(lines, i, (addLoopCheck || line.startsWith('on') && ['loop1', 'loop2'].includes(params[0])));

        if (line.startsWith('on') && ['loop1', 'loop2'].includes(params[0])) ret += `context.${params[0]} = ${callback}` + "\n";
        else if (line.startsWith('on')) ret += `context.addEventListener('${params[0]}', ${callback})` + "\n";
        else if (line.startsWith('if')) ret += this.parseIfBlock(line, params, callback) + "\n";

        i = nextLine;
      }
    }

    return `async ()=>{${ret}}`;
  }

  private static parseSingleLine(line: string, addLoopCheck = false): string {
    const paramsMatch = line.match(/\((?<params>.+)\)/);
    let params: string[] = [];
    if (paramsMatch)
      params = paramsMatch!.groups!.params.split(';').map(param => this.sanitizeString(param));

    const buildFunctionCall = (f: string, stringIndexes: number[] | true = [], async = false): string => {
      let ret = '';

      if (addLoopCheck)
        ret += 'if (!context.isActive) {return;} ';

      ret += (async ? 'await ' : '') + f + '(';

      const fragments: string[] = [];
      for (let i = 0; i < params.length; i++) {
        const isString = (stringIndexes === true) || stringIndexes.includes(i);

        const param = this.parseVariables(params[i], isString);
        if (isString)
          fragments.push(`\`${param}\``);
        else
          fragments.push(this.sanitizeOtherParameters(param));
      }

      ret += fragments.join(', ');

      ret += ');';
      return ret;
    };

    const s = (input: string) => line.startsWith(input);

    if (s('showinfo')) return buildFunctionCall('PacdkFunctions.showinfo', [0]);
    if (s('minicut')) return buildFunctionCall('PacdkFunctions.minicut', [0]);
    if (s('wait')) return buildFunctionCall('PacdkFunctions.wait', [0], true);
    if (s('function')) return buildFunctionCall('PacdkFunctions.function', [0, 1], true);
    if (s('cutscene')) return buildFunctionCall('PacdkFunctions.cutscene', [0], true);

    
    //#region Variables
    if (s('setbool')) return buildFunctionCall('PacdkFunctions.setbool', [0]);
    if (s('setfocus')) return buildFunctionCall('PacdkFunctions.setfocus', [0]);
    if (s('setfont')) return buildFunctionCall('PacdkFunctions.setfont', [1]);
    if (s('infotextcolor')) return buildFunctionCall('PacdkFunctions.infotextcolor');
    if (s('instmouse')) return buildFunctionCall('PacdkFunctions.instmouse', [0]);
    if (s('loadnum')) return buildFunctionCall('PacdkFunctions.loadnum', [0]);
    if (s('loadstring')) return buildFunctionCall('PacdkFunctions.loadstring', [0]);
    if (s('offtextcolor')) return buildFunctionCall('PacdkFunctions.offtextcolor');
    if (s('randomnum')) return buildFunctionCall('PacdkFunctions.randomnum', [0]);
    if (s('savenum')) return buildFunctionCall('PacdkFunctions.savenum');
    if (s('savestring')) return buildFunctionCall('PacdkFunctions.savestring', [0]);
    if (s('set_rect_walkmap')) return buildFunctionCall('PacdkFunctions.set_rect_walkmap', [0]);
    if (s('setnum')) return buildFunctionCall('PacdkFunctions.setnum', [0, 1]);
    if (s('setscreenchange')) return buildFunctionCall('PacdkFunctions.setscreenchange', [0]);
    if (s('setstring')) return buildFunctionCall('PacdkFunctions.setstring', [0, 1]);
    if (s('settransparency')) return buildFunctionCall('PacdkFunctions.settransparency');
    if (s('setwalkmap')) return buildFunctionCall('PacdkFunctions.setwalkmap', [0]);
    if (s('sqrt')) return buildFunctionCall('PacdkFunctions.sqrt', [0]);
    if (s('arcsin')) return buildFunctionCall('PacdkFunctions.arcsin', [0]);
    if (s('downloadstring')) return buildFunctionCall('PacdkFunctions.downloadstring', [0, 1], true);
    //#endregion

    //#region Sound & video
    if (s('musicvolume')) return buildFunctionCall('PacdkFunctions.musicvolume');
    if (s('playmusic')) return buildFunctionCall('PacdkFunctions.playmusic', [0]);
    if (s('playsound')) return buildFunctionCall('PacdkFunctions.playsound', [0, 2]);
    if (s('stopmusic')) return buildFunctionCall('PacdkFunctions.stopmusic');
    if (s('stopsound')) return buildFunctionCall('PacdkFunctions.stopsound', [0]);
    if (s('fadespeed')) return buildFunctionCall('PacdkFunctions.fadespeed', [0]);
    if (s('loopsound')) return buildFunctionCall('PacdkFunctions.loopsound', [0, 2]);
    if (s('loopstop')) return buildFunctionCall('PacdkFunctions.loopstop', [0]);
    if (s('playvideo')) return buildFunctionCall('PacdkFunctions.playvideo', [0], true);
    if (s('speechvolume')) return buildFunctionCall('PacdkFunctions.speechvolume');
    if (s('soundvolume')) return buildFunctionCall('PacdkFunctions.soundvolume');
    if (s('stopvideo')) return buildFunctionCall('PacdkFunctions.stopvideo');
    if (s('setdsp')) return buildFunctionCall('PacdkFunctions.setdsp', [0]);
    if (s('extractsound')) return buildFunctionCall('PacdkFunctions.extractsound', [0], true);
    if (s('playanimation')) return buildFunctionCall('PacdkFunctions.playanimation', [0], true);
    if (s('stopanimation')) return buildFunctionCall('PacdkFunctions.stopanimation');
    //#endregion

    //#region Objects
    if (s('setobj')) return buildFunctionCall('PacdkFunctions.setobj', [0]);
    if (s('group')) return buildFunctionCall('PacdkFunctions.group', true);
    if (s('instobj')) return buildFunctionCall('PacdkFunctions.instobj', [0]);
    if (s('moveobj')) return buildFunctionCall('PacdkFunctions.moveobj', [0, 3], true);
    if (s('setobjlight')) return buildFunctionCall('PacdkFunctions.setobjlight', [0, 4]);
    if (s('setobjalpha')) return buildFunctionCall('PacdkFunctions.setobjalpha', [0, 2]);
    if (s('transformobj')) return buildFunctionCall('PacdkFunctions.transformobj', [0, 1, 6]);
    //#endregion
    
    //#region Rooms
    if (s('jiggle')) return buildFunctionCall('PacdkFunctions.jiggle');
    if (s('loadroom')) return buildFunctionCall('PacdkFunctions.loadroom', [0]);
    if (s('return')) return buildFunctionCall('PacdkFunctions.return');
    if (s('setpos')) return buildFunctionCall('PacdkFunctions.setpos', [0, 4]);
    if (s('subroom')) return buildFunctionCall('PacdkFunctions.subroom', [0]);
    if (s('unloadroom')) return buildFunctionCall('PacdkFunctions.unloadroom');
    if (s('scrollspeed')) return buildFunctionCall('PacdkFunctions.scrollspeed');
    if (s('setlight')) return buildFunctionCall('PacdkFunctions.setlight', [0]);
    if (s('unloadsub')) return buildFunctionCall('PacdkFunctions.unloadsub', [0]);
    //#endregion
    
    //#region Characters
    if (s('beamto')) return buildFunctionCall('PacdkFunctions.beamto', [0, 1]);
    if (s('follow')) return buildFunctionCall('PacdkFunctions.follow', [0, 1, 2], true);
    if (s('lookto')) return buildFunctionCall('PacdkFunctions.lookto', [0]);
    if (s('offspeech')) return buildFunctionCall('PacdkFunctions.offspeech', [2, 3, 4], true);
    if (s('pickup')) return buildFunctionCall('PacdkFunctions.pickup', [0]);
    if (s('setchar')) return buildFunctionCall('PacdkFunctions.setchar', true);
    if (s('speech')) return buildFunctionCall('PacdkFunctions.speech', [0, 1, 2], true);
    if (s('walkto')) return buildFunctionCall('PacdkFunctions.walkto', [0, 4], true);
    if (s('charzoom')) return buildFunctionCall('PacdkFunctions.charzoom', [0]);
    if (s('linkchar')) return buildFunctionCall('PacdkFunctions.linkchar', [0, 1]);
    if (s('offalign')) return buildFunctionCall('PacdkFunctions.offalign', [0]);
    if (s('runspeed')) return buildFunctionCall('PacdkFunctions.runspeed');
    if (s('runto')) return buildFunctionCall('PacdkFunctions.runto', [0, 4], true);
    if (s('setcharalpha')) return buildFunctionCall('PacdkFunctions.setcharalpha', [0]);
    if (s('setcharlight')) return buildFunctionCall('PacdkFunctions.setcharlight', [0]);
    if (s('setwalksound')) return buildFunctionCall('PacdkFunctions.setwalksound', [0, 1]);
    if (s('stepto')) return buildFunctionCall('PacdkFunctions.stepto', [0]);
    if (s('stopzooming')) return buildFunctionCall('PacdkFunctions.stopzooming', [0]);
    if (s('switchchar')) return buildFunctionCall('PacdkFunctions.switchchar', [0, 1]);
    if (s('unlinkchar')) return buildFunctionCall('PacdkFunctions.unlinkchar', [0]);
    if (s('loadchar')) return buildFunctionCall('PacdkFunctions.loadchar', [0]);
    //#endregion

    if (line.match(/\(\*(.+)\*\)/)) return line.replace(/\(\*(.+)\*\)/, '/*$1*/');

    return `console.warn(\`Unknown build in function: "${line}"\`)`;
  }

  private static sanitizeString(input: string): string {
    return input.replace(/\|#\d+#\|/g, '').trim();
  }

  private static sanitizeOtherParameters(input: string): string {
    return input.replace(/,/g, '.').replace(/:/g, '/').trim();
  }

  private static parseVariables(input: string, isString: boolean = false): string {
    if (isString)
      return input.replace(/\[([\w:]+)\]/g, '${PacdkVariablesModel["$1"]}');

    return input.replace(/\[([\w:]+)\]/g, 'PacdkVariablesModel["$1"]');
  }

  private static parseCodeBlock(lines: string[], startingLine: number, addLoopCheck = false): {callback: string, nextLine: number} {
    let code = '';
    let bracketCounter = 0;
    
    for (let i = startingLine+1; i < lines.length; i++) {
      const line = lines[i];
      code += line + "\n";

      if (line.includes('{'))
        bracketCounter++;

      if (line.includes('}'))
        bracketCounter--;

      if (line.startsWith('on') || line.startsWith('if'))
        continue;

      if (bracketCounter <= 0)
        break;
    }

    code = code.substring(0, code.length-1);

    const codeLength = code.split("\n").length;

    if (codeLength > 1 && code.startsWith('{'))
      code = code.substring(2, code.length-2);

    return {
      callback: this.parseMultiLine(code, addLoopCheck),
      nextLine: startingLine + codeLength
    };
  }

  private static parseIfBlock(line: string, params: string[], callback: string) {
    const s = (term: string) => line.startsWith('if_' + term) || line.startsWith('ifnot_' + term);
    const c = () => {
      if (params[1] && (params[1].includes('<') || params[1].includes('>'))) 
        return '';

      return line.startsWith('ifnot_') ? '!=' : '==' // Not type save on purpose
    };
    const p = (index: number, isString: boolean = false) => {
      if (isString)
        return this.parseVariables(this.sanitizeString(params[index]), true);
      return this.parseVariables(this.sanitizeOtherParameters(params[index]));
    }

    if (s('bool')) return `if (PacdkVariablesModel['${p(0, true)}'] ${c()} !!${p(1)}) {await (${callback})()}`;
    if (s('focus')) return `if (PacdkInternalVariablesModel.FocussedCharacter ${c()} '${p(0, true)}') {await(${callback})()}`;
    // TODO givelink
    if (s('hasitem')) return `{const tmp_hasitem_char = PacdkHelpers.getCharacter('${p(0, true)}'); if (tmp_hasitem_char && tmp_hasitem_char.hasItem('${p(1, true)}')) {await (${callback})()}}`;
    // TODO link
    if (s('obj')) return `{const tmp_obj = PacdkHelpers.getObject('${p(0, true)}'); if (tmp_obj && tmp_obj.state ${c()} ${p(1, false)}) {await (${callback})()}}`;
    // TODO charin
    // TODO command
    // TODO ischar
    // TODO item
    // TODO keydown
    // TODO keypressed
    // TODO mousewheel
    if (s('num')) return `if (!PacdkVariablesModel['${p(0, true)}']) PacdkVariablesModel['${p(0, true)}'] = 0; if (PacdkVariablesModel['${p(0, true)}'] ${c()} ${p(1)}) {await (${callback})()}`;
    // TODO room
    if (s('string')) return `if (PacdkVariablesModel['${p(0, true)}'] ${c()} '${p(1, true)}') {await (${callback})()}`;
    // TODO textscene 
    // TODO paddown
    // TODO padpressed
    if (s('touch')) return `if ((navigator.maxTouchPoints > 0) ${c()} !!${p(0, true)}) {await (${callback})()}`;


    console.warn('If statement not found!', line, params, callback);
    return '';
  }
}
