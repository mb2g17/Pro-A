import Automata from "@/classes/Automata";

/**
 * Class containing a bunch of automata operations to perform
 */
export default class AutomataOperations {
    /**
     * Filters out initial states from a group of state IDs
     * @param automata - the automata instace of which these states belong to
     * @param group - a set of state IDs to filter
     * @returns a set of initial states filtered from the given set of states
     */
    public static getInitialStates(automata: Automata, group: Set<string>) {
        return new Set([...group].filter(n => automata.getStateById(n).data.initial));
    }

    /**
     * Filters out final states from a group of state IDs
     * @param automata - the automata instace of which these states belong to
     * @param group - a set of state IDs to filter
     * @returns a set of final states filtered from the given set of states
     */
    public static getFinalStates(automata: Automata, group: Set<string>) {
        return new Set([...group].filter(n => automata.getStateById(n).data.final));
    }

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
            automata.addTransition("ε", newStateName, initialStateName);

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
                automata.addTransition("ε", finalStateName, initialStateName);

                // Make this not an initial state anymore
                automata.setInitialState(initialStateName, false);
                if (cy)
                    cy.$(`#${initialState}`).removeClass("initial-node");
            }
        }
    }

    /**
     * Performs Kleene star
     * @param automata - the automata object to edit
     * @param group1 - the group of final states of the automata
     * @param group2 - the group of initial states of the automata
     * @param cy - the cytoscape instance (optional)
     */
    public static kleeneStar(automata: Automata, group1: Set<string>, group2: Set<string>, cy?: any) {
        // Gets midpoint position of all initial states
        const midX: number = [...group2].reduce((total, currentValue, currentIndex, arr) =>
            automata.getStateById(currentValue).position.x + total, 0) / [...group2].length;
        const midY: number = [...group2].reduce((total, currentValue, currentIndex, arr) =>
            automata.getStateById(currentValue).position.y + total, 0) / [...group2].length;

        // Creates a new node
        const newNodeName = automata.getNewStateName();
        automata.addState(newNodeName, midX, midY, true, true);

        // Makes all the final states go to it
        for (const finalState of group1) {
            // Gets final state name
            const finalStateName = automata.getStateById(finalState).data.name;

            // Creates transition
            automata.addTransition("ε", finalStateName, newNodeName);
        }

        // Makes it go to all the initial states
        for (const initialState of group2) {
            // Gets initial state name
            const initialStateName = automata.getStateById(initialState).data.name;

            // Creates transition
            automata.addTransition("ε", newNodeName, initialStateName);

            // Make this not an initial state anymore
            automata.setInitialState(initialStateName, false);
            if (cy)
                cy.$(`#${initialState}`).removeClass("initial-node");
        }
    }

    /**
     * Duplicates a group of objects in an automata
     * @param automata - the automata to copy stuff from
     * @param group - the group of objects to copy
     * @returns the set of new duplicated objects
     */
    public static duplicate(automata: Automata, group: Set<string>): Set<string> {
        // Stores mapping of old state names to new state names
        const newName: any = {};

        // Stores the set of new duplicated objects, by ID
        const duplicatedObjects: Set<string> = new Set();

        // Set up some functions to help, returns new name of this state
        function addState(srcObj: any): string {
            // If we've already duplicated this state, then leave
            if (newName[srcObj.data.id])
                return newName[srcObj.data.name];

            // Get new name (if it doesn't already exist)
            const targetObjName = newName[srcObj.data.name] ? newName[srcObj.data.name] : automata.getNewStateName();

            // Store in the mapping
            newName[srcObj.data.name] = targetObjName;

            // Creates new node
            automata.addState(targetObjName,
                srcObj.position.x + 10,
                srcObj.position.y + 10,
                srcObj.data.initial,
                srcObj.data.final);

            // Stores this in return set
            duplicatedObjects.add(automata.getState(targetObjName).data.id);

            return targetObjName;
        }

        function addTransition(srcObj: any) {
            // Gets data
            const [srcSymbol, srcSrc, srcTarget] = [srcObj.data.symbol, srcObj.data.sourceName, srcObj.data.targetName];

            // Gets new source and target names
            let targetSrc: string;
            let targetTarget: string;
            if (newName[srcSrc])
                targetSrc = newName[srcSrc];
            else
                targetSrc = addState(automata.getState(srcSrc));

            if (newName[srcTarget])
                targetTarget = newName[srcTarget];
            else
                targetTarget = addState(automata.getState(srcTarget));

            // Creates transition
            automata.addTransition(srcSymbol, targetSrc, targetTarget, srcObj.data);

            // Stores this in return set
            duplicatedObjects.add(automata.getTransition(srcSymbol, targetSrc, targetTarget).data.id);
        }

        // Goes through each object
        for (const srcObjID of group) {
            // Fetch object
            const srcObj = automata.getData()[srcObjID];

            if (!srcObj) {
                console.log("Undefined obj!");
                console.log("ID: " + srcObjID);
            }

            // If it's a node
            if (srcObj.data.type === "node") {
                addState(srcObj);
            }
            else if (srcObj.data.type === "edge")
                addTransition(srcObj);
        }

        return duplicatedObjects;
    }
}