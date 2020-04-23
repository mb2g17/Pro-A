import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import PushdownAutomata from '@/classes/PushdownAutomata';
import TuringMachine from '@/classes/TuringMachine';
import _ from "lodash";

/**
 * Deserializes an automata
 * @param serialized - the serialization of the automata to instantiate
 * @returns a new Automata based on the passed serialization
 */
export default function(serialized: string): Automata {
    // Deserialize
    let json: any = JSON.parse(serialized);

    // Creates automata
    let automata: Automata;

    // Depending on type, instantiate automata
    switch (json.modelName) {
        case "Finite Automata":
        default:
            automata = new FiniteAutomata();
            break;
        case "Pushdown Automata":
            automata = new PushdownAutomata();
            break;
        case "Turing Machine":
            automata = new TuringMachine();
            break;
    }
    // Sets up a quick function to convert str --> array to str --> set
    function arrayToSetMap(setObj: any) {
        return _.mapValues(setObj, array => new Set(array));
    }

    // Sets properties
    automata.setName(json.name);
    automata.setData(json.data);
    automata["cacheEdgeID"] = json.cacheEdgeID;
    automata["cacheNodeID"] = json.cacheNodeID;
    automata["cacheInitialStates"] = new Set(json.cacheInitialStates);
    automata["cacheFinalStates"] = new Set(json.cacheFinalStates);

    // Refreshes cache
    automata.cacheTransition.refresh(automata);
    automata.cacheFoldedStates.refresh(automata);

    // Return automata
    return automata;
}
