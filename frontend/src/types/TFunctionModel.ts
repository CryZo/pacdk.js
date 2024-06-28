// import { TFunctionTypes } from ".";
import type Character from "../classes/Character";
import Room from "../classes/Room";

type TFunctionModel = {
    Character?: {
        [key: string]: Character;
    },
    Cutscene?: {
        [key: string]: (context: EventTarget) => void;
    }
    Item?: {
        [key: string]: (context: EventTarget) => void;
    }
    Object?: {
        [parent: string]: {
            [key: string]: (context: EventTarget) => void;
        }
    }
    Room?: {
        [key: string]: Room;
    }
    Walkmap?: {
        [key: string]: (context: EventTarget) => void;
    }
};

export default TFunctionModel;
