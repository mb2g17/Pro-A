import Automata from "@/classes/Automata";

/**
 * Class containing a bunch of automata operations to perform
 */
export default class AutomataOperations {
    /**
     * Performs union
     * @param automata - the automata object to edit
     * @param group1 - the first group of node IDs
     * @param group2 - the second group of node IDs
     * @param cy - the cytoscape instance (optional)
     */
    public static union(automata: Automata, group1: Set<string>, group2: Set<string>, cy?: any) {
        // Gets the initial states from groups 1 and 2
        const initialStates = [...group1, ...group2].filter(n => automata.getStateById(n).data.initial);

        // Gets midpoint position of all of them
        const midX: number = initialStates.reduce((total, currentValue, currentIndex, arr) =>
            automata.getStateById(currentValue).position.x + total, 0) / initialStates.length;
        const midY: number = initialStates.reduce((total, currentValue, currentIndex, arr) =>
            automata.getStateById(currentValue).position.y + total, 0) / initialStates.length;

        // Create a node that epsilon moves to the initial states
        const newStateName: string = automata.getNewStateName();
        automata.addState(newStateName, midX, midY, true, false);
        for (const initialState of initialStates) {
            // Gets initial state name
            const initialStateName: string = automata.getStateById(initialState).data.name;

            // Make transition from new node to this initial node
            automata.addTransition("__epsilon", newStateName, initialStateName);

            // Makes all the other initial states not initial states
            automata.setInitialState(initialStateName, false);

            // If we have a cytoscape instance
            if (cy)
                cy.$(`#${initialState}`).removeClass("initial-node");
        }
    }

    /**
     * Performs concatenation
     * @param automata - the automata object to edit
     * @param group1 - the group of final states of sub-automata 1
     * @param group2 - the group of initial states of sub-automata 2
     * @param cy - the cytoscape instance (optional)
     */
    public static concatenation(automata: Automata, group1: Set<string>, group2: Set<string>, cy?: any) {
        // For each final state
        for (const finalState of group1) {
            // Gets final state name
            const finalStateName = automata.getStateById(finalState).data.name;

            // Make this not a final state anymore
            automata.setFinalState(finalStateName, false);
            if (cy)
                cy.$(`#${finalState}`).removeClass("final-node");

            // For each initial state
            for (const initialState of group2) {
                // Gets initial state name
                const initialStateName = automata.getStateById(initialState).data.name;

                // Create an epsilon move for this
                automata.addTransition("__epsilon", finalStateName, initialStateName);

                // Make this not an initial state anymore
                automata.setInitialState(initialStateName, false);
                if (cy)
                    cy.$(`#${initialState}`).removeClass("initial-node");
            }
        }
    }
}