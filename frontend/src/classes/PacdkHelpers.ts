import type Character from "./Character";
import Room from "./Room";
import PacdkObject from "./Object";

export default class PacdkHelpers {
  public static getCharacter(id: string): Character | null {
    if (id === 'self')
      id = this.nameToId(window.PacdkInternalVariablesModel.FocussedCharacter);

    id = this.nameToId(id);

    if (window.PacdkFunctionModel.Character && window.PacdkFunctionModel.Character[id])
      return window.PacdkFunctionModel.Character[id]

    return null;
  }

  public static getObject(id: string): PacdkObject | null {
    id = this.nameToId(id);

    if (!window.PacdkFunctionModel.Room || !window.PacdkInternalVariablesModel.ObjectToRoomMapping[id] || !window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]])
      return null;

    return window.PacdkFunctionModel.Room[window.PacdkInternalVariablesModel.ObjectToRoomMapping[id]].objects[id];
  }

  public static getRoom(id: string): Room | null {
    id = this.nameToId(id);

    if (window.PacdkFunctionModel.Room && window.PacdkFunctionModel.Room[id])
      return window.PacdkFunctionModel.Room[id]

    return null;
  }

  public static nameToId(name: string): string {
    if (!name)
      return '';

    return name
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss');
  }

  public static addMouseEvents(context: EventTarget, el: HTMLElement) {
    el.addEventListener('click', ()=> {
      context.dispatchEvent(new Event(window.PacdkGameUi.command))
      context.dispatchEvent(new Event('click'));
    });
    el.addEventListener('contextmenu', ()=> {
      context.dispatchEvent(new Event('look')) //TODO aus Variable laden
      context.dispatchEvent(new Event('rightclick'));
    });
    el.addEventListener('dblclick', ()=> context.dispatchEvent(new Event('doubleclick')));
    el.addEventListener('mouseenter', ()=> context.dispatchEvent(new Event('mouse')));
    el.addEventListener('mouseleave', ()=> context.dispatchEvent(new Event('mouseout')));
    el.addEventListener('mouseleave', ()=> window.PacdkGameUi.infoText = null);
  }
}
