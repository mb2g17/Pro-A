import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import PushdownAutomata from '@/classes/PushdownAutomata';
import TuringMachine from '@/classes/TuringMachine';

/**
 * Deserializes an automata
 * @param serialized - the serialization of the automata to instantiate
 * @returns a new Automata based on the passed serialization
 */
export default function(serialized: string): Automata {
    // Deserialize
    const json: any = JSON.parse(window.atob(serialized));

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

    // Sets properties
    automata.setName(json.name);
    automata.setData(json.data);
    automata["edgeID"] = json.edgeID;
    automata["nodeID"] = json.nodeID;
    automata["initialStates"] = new Set(json.initialStates);
    automata["finalStates"] = new Set(json.finalStates);

    // Return automata
    return automata;
}
