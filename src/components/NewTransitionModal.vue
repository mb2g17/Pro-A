<template>

    <!-- New transition modal -->
    <b-modal :id="modalID" v-model="isModalVisible" @hide="$emit('hide')">
        <template v-slot:modal-title>
            {{ mode === NewTransitionModalMode.ADD ? `New Transition (${automataType})` : `Edit transition (${automataType})` }}
        </template>

        <!-- Body -->
        <b-form @submit="">
            <!-- Transition symbol -->
            <b-form-group :label="`Transition symbol: ${transitionSymbol}`">
                <b-form-input v-model="inputtedTransitionSymbol" placeholder="a"
                              :disabled="isEpsilonMove || tmState.isEmptySymbol || tmState.isNonEmptySymbol || tmState.isCircledSymbol || tmState.isUncircledSymbol || tmState.isStartTapeSymbol"
                ></b-form-input>
            </b-form-group>

            <!-- Special transition symbols -->
            <b-form-group>
                <b-form-checkbox v-model="isEpsilonMove">Epsilon move</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isEmptySymbol" v-if="automataType === 'TM'">Empty symbol</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isNonEmptySymbol" v-if="automataType === 'TM'">Non-empty symbol</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isCircledSymbol" v-if="automataType === 'TM'">Circled symbol</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isUncircledSymbol" v-if="automataType === 'TM'">Uncircled symbol</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isStartTapeSymbol" v-if="automataType === 'TM'">Start of the tape symbol</b-form-checkbox>
            </b-form-group>

            <!-- Pushdown automata -->
            <template v-if="automataType === 'PDA'">

                <!-- Input stack symbol -->
                <b-form-group :label="`Input stack symbol: ${inputStackSymbol}`">
                    <b-form-input v-model="pdaState.inputtedInputStackSymbol" placeholder="A" :disabled="pdaState.isEmptyStackSymbol || pdaState.isAnySymbol"></b-form-input>
                </b-form-group>

                <!-- Special input stack symbols -->
                <b-form-group>
                    <b-form-checkbox v-model="pdaState.isEmptyStackSymbol">Empty stack symbol</b-form-checkbox>
                    <b-form-checkbox v-model="pdaState.isAnySymbol">Any symbol</b-form-checkbox>
                </b-form-group>

                <!-- Output stack symbol -->
                <b-form-group :label="`Output stack symbols: ${outputStackSymbols.length === 0 ? 'Do not output any stack symbols' : outputStackSymbols.join(',')}`">
                    <b-container class="pl-0 pr-0 flex-column justify-content-center">

                        <b-row align-h="center" v-for="(outputStackSymbol, outputStackSymbolIndex) in pdaState.inputtedOutputStackSymbols" class="mt-2">
                            <b-col cols="10">
                                <!-- Input box -->
                                <b-form-input v-model="pdaState.inputtedOutputStackSymbols[outputStackSymbolIndex]" placeholder="A"></b-form-input>
                            </b-col>
                            <b-col cols="2" class="pl-0">
                                <!-- Delete button -->
                                <b-button class="w-100" variant="outline-danger"
                                          @click="pdaState.inputtedOutputStackSymbols.splice(outputStackSymbolIndex, 1)"
                                >-</b-button>
                            </b-col>
                        </b-row>

                        <b-row align-h="center">
                            <b-col cols="3"></b-col>
                            <b-col>
                                <!-- Add button -->
                                <b-button class="w-100 mt-2" variant="outline-primary" align-h="center" @click="pdaState.inputtedOutputStackSymbols.push('')">+</b-button>
                            </b-col>
                            <b-col cols="3"></b-col>
                        </b-row>


                    </b-container>
                </b-form-group>

            </template>

            <!-- Turing machine -->
            <template v-if="automataType === 'TM'">

                <!-- Symbol to write -->
                <b-form-group :label="`Symbol to write: ${payload.writeTapeSymbol}`">
                    <b-form-input v-model="tmState.symbolToWrite" placeholder="a"
                                  :disabled="tmState.isWriteEmptySymbol || tmState.isWriteNothing || tmState.isCircle || tmState.isUncircle"
                    ></b-form-input>
                </b-form-group>

                <!-- Special write symbols -->
                <b-form-group>
                    <b-form-checkbox v-model="tmState.isWriteEmptySymbol">Empty symbol</b-form-checkbox>
                    <b-form-checkbox v-model="tmState.isWriteNothing">Write nothing</b-form-checkbox>
                    <b-form-checkbox v-model="tmState.isCircle">Circled read symbol</b-form-checkbox>
                    <b-form-checkbox v-model="tmState.isUncircle">Uncircled read symbol</b-form-checkbox>
                </b-form-group>

                <!-- Direction -->
                <b-form-group :label="`Direction: ${tmState.direction}`">
                    <b-form-radio-group
                            v-model="tmState.direction"
                            :options="[{text: 'L(eft)', value: 'L'}, {text: 'S(tay)', value: 'S'}, {text: 'R(ight)', value: 'R'}]"
                            buttons
                            button-variant="outline-primary"
                            class="w-100"
                    ></b-form-radio-group>
                </b-form-group>

            </template>

        </b-form>

        <template v-slot:modal-footer>
            <div class="w-100">
                <b-button variant="danger" class="float-left" @click="onCancelClick">Cancel</b-button>
                <b-button v-if="mode === NewTransitionModalMode.ADD" variant="primary" class="float-right" @click="onAddClick">Add</b-button>
                <b-button v-if="mode === NewTransitionModalMode.EDIT" variant="primary" class="float-right" @click="onEditClick">Edit</b-button>
            </div>
        </template>
    </b-modal>

</template>

<script lang="ts">
    import Vue from "vue";
    import uuid from "uuid/v1";
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Automata from "@/classes/Automata";
    import FiniteAutomata from "@/classes/FiniteAutomata";
    import PushdownAutomata from "@/classes/PushdownAutomata";
    import TuringMachine from "@/classes/TuringMachine";
    import {AutomataCharacters} from '@/classes/AutomataCharacters';

    /** The types of modes the modal can be in */
    export enum NewTransitionModalMode {
        /** Will add a new transition */
        ADD,
        /** Will edit an existing transition */
        EDIT
    }

    @Component
    export default class NewTransitionModal extends Vue {

        /** The automata being modelled */
        @Prop() public readonly automata!: Automata;

        /** The mode the modal is in right now */
        private mode: NewTransitionModalMode = NewTransitionModalMode.ADD;

        /** ID of this modal (there will be multiple) */
        private modalID: string = "";

        /** True if modal is visible, false if not */
        private isModalVisible: boolean = false;

        /** The inputted (raw) transition symbol */
        private inputtedTransitionSymbol: string = "";

        /** State of inputs if it's a PDA */
        private pdaState: any = {
            inputtedInputStackSymbol: "",
            isEmptyStackSymbol: false,
            isAnySymbol: false,
            inputtedOutputStackSymbols: [""]
        };

        /** State of inputs if it's a TM */
        private tmState: any = {
            isEmptySymbol: false,
            isNonEmptySymbol: false,
            isCircledSymbol: false,
            isUncircledSymbol: false,
            isStartTapeSymbol: false,

            isWriteEmptySymbol: false,
            isWriteNothing: false,
            isCircle: false,
            isUncircle: false,

            symbolToWrite: '',
            direction: 'L'
        };

        /** If true, this is an epsilon move. False if not */
        private isEpsilonMove: boolean = false;

        /** Stores source node of this new transition (if add mode) */
        private sourceNode: any;

        /** Stores target node of this new transition (if add mode) */
        private targetNode: any;

        /** Stores the transition ID we are editing (if edit mode) */
        private transitionID: string = "";

        mounted() {
            this.modalID = uuid(); // Sets random modal ID
        }

        get NewTransitionModalMode() {
            return NewTransitionModalMode;
        }

        /**
         * The real transition symbol
         */
        get transitionSymbol() {
            // Epsilon move
            if (this.isEpsilonMove)
                return AutomataCharacters.Epsilon;

            if (this.tmState.isEmptySymbol)
                return AutomataCharacters.EmptySymbol;

            if (this.tmState.isNonEmptySymbol)
                return AutomataCharacters.NonEmptySymbol;

            if (this.tmState.isCircledSymbol)
                return AutomataCharacters.CircleSymbol;

            if (this.tmState.isUncircledSymbol)
                return AutomataCharacters.UncircleSymbol;

            if (this.tmState.isStartTapeSymbol)
                return AutomataCharacters.StartTapeSymbol;

            // Default value
            if (this.inputtedTransitionSymbol)
                return this.inputtedTransitionSymbol;
            else
                return 'a';
        }

        /**
         * The real inputted stack symbol (PDA only)
         */
        get inputStackSymbol() {
            if (this.pdaState.isEmptyStackSymbol)
                return AutomataCharacters.EmptyStackSymbol;
            if (this.pdaState.isAnySymbol)
                return AutomataCharacters.Epsilon;
            return this.pdaState.inputtedInputStackSymbol ? this.pdaState.inputtedInputStackSymbol : "A";
        }

        /**
         * The real output stack symbols (PDA only)
         */
        get outputStackSymbols() {
            return this.pdaState.inputtedOutputStackSymbols.map((symbol: any) => symbol ? symbol : 'A');
        }

        /**
         * The payload needed to pass into the automata method
         */
        get payload() {
            if (this.automataType === "PDA")
                return {
                    input: this.inputStackSymbol,
                    output: this.outputStackSymbols
                };
            if (this.automataType === "TM")
                return {
                    writeTapeSymbol: this.tmState.isWriteEmptySymbol ? AutomataCharacters.EmptySymbol :
                        this.tmState.isWriteNothing ? AutomataCharacters.WriteNothingSymbol :
                        this.tmState.isCircle ? AutomataCharacters.CircleSymbol :
                        this.tmState.isUncircle ? AutomataCharacters.UncircleSymbol :
                        this.tmState.symbolToWrite ? this.tmState.symbolToWrite : 'a',
                    direction: this.tmState.direction
                };
            return {};
        }

        /**
         * Gets the type of automata we're doing a transition for
         * @returns 'FA', 'PDA' or 'TM'. undefined if it's something else entirely
         */
        get automataType(): "FA" | "PDA" | "TM" | undefined {
            if (this.automata instanceof FiniteAutomata)
                return "FA";
            if (this.automata instanceof PushdownAutomata)
                return "PDA";
            if (this.automata instanceof TuringMachine)
                return "TM";
            return undefined;
        }

        /**
         * Shows the modal, "add" mode
         */
        public show(sourceNode: any, targetNode: any) {
            // Sets mode
            this.mode = NewTransitionModalMode.ADD;

            // Stores data
            this.sourceNode = sourceNode;
            this.targetNode = targetNode;

            // Clears data
            this.clearData();

            // Shows the modal
            this.$bvModal.show(this.modalID);
        }

        /**
         * Shows the modal, "edit" mode
         */
        public showEdit(transitionID: string) {
            // Sets mode
            this.mode = NewTransitionModalMode.EDIT;

            // Remembers transition ID
            this.transitionID = transitionID;

            // Clears data
            this.clearData();

            // Gets transition
            const transition = this.automata.getData()[transitionID].data;

            // Gets source and target states
            const [source, target] = [this.automata.getData()[transition.source], this.automata.getData()[transition.target]];
            this.sourceNode = {
                "_private": source
            };
            this.targetNode = {
                "_private": target
            };

            // Fills in data
            this.isEpsilonMove = transition.symbol === AutomataCharacters.Epsilon;

            if (this.automata instanceof PushdownAutomata) {
                this.pdaState.isEmptyStackSymbol = transition.input === AutomataCharacters.EmptyStackSymbol;
                this.pdaState.isAnySymbol = transition.input === AutomataCharacters.Epsilon;
                if (!this.pdaState.isEmptyStackSymbol && !this.pdaState.isAnySymbol)
                    this.pdaState.inputtedInputStackSymbol = transition.input;
                this.pdaState.inputtedOutputStackSymbols = transition.output;
            } else if (this.automata instanceof TuringMachine) {
                this.tmState.isEmptySymbol = transition.readTapeSymbol === AutomataCharacters.EmptySymbol;
                this.tmState.isStartTapeSymbol = transition.readTapeSymbol === AutomataCharacters.StartTapeSymbol;

                // Because non-empty are technically epsilon moves, we need to deselect flag
                if (transition.readTapeSymbol === AutomataCharacters.NonEmptySymbol) {
                    this.tmState.isNonEmptySymbol = true;
                    this.isEpsilonMove = false;
                }

                // Because circled symbols are technically epsilon moves, we need to deselect flag
                if (transition.readTapeSymbol === AutomataCharacters.CircleSymbol) {
                    this.tmState.isCircledSymbol = true;
                    this.isEpsilonMove = false;
                }

                // Because uncircled symbols are technically epsilon moves, we need to deselect flag
                if (transition.readTapeSymbol === AutomataCharacters.UncircleSymbol) {
                    this.tmState.isUncircledSymbol = true;
                    this.isEpsilonMove = false;
                }

                this.$set(this.tmState, "isWriteEmptySymbol", transition.writeTapeSymbol === AutomataCharacters.EmptySymbol);
                this.$set(this.tmState, "isWriteNothing", transition.writeTapeSymbol === AutomataCharacters.WriteNothingSymbol);
                this.$set(this.tmState, "isCircle", transition.writeTapeSymbol === AutomataCharacters.CircleSymbol);
                this.$set(this.tmState, "isUncircle", transition.writeTapeSymbol === AutomataCharacters.UncircleSymbol);
                if (!this.tmState.isWriteEmptySymbol &&
                    !this.tmState.isWriteNothing &&
                    !this.tmState.isCircle &&
                    !this.tmState.isUncircle)
                    this.tmState.symbolToWrite = transition.writeTapeSymbol;
                this.tmState.direction = transition.direction;
            }

            if (!this.isEpsilonMove && !this.tmState.isEmptySymbol)
                this.inputtedTransitionSymbol = transition.symbol;

            // Shows the modal
            this.$bvModal.show(this.modalID);
        }

        /**
         * Clears data
         */
        private clearData() {
            this.inputtedTransitionSymbol = "";
            this.isEpsilonMove = false;
            this.pdaState = {
                inputtedInputStackSymbol: "",
                isEmptyStackSymbol: false,
                isAnySymbol: false,
                inputtedOutputStackSymbols: [""]
            };
            this.tmState = {
                isEmptySymbol: false,
                isNonEmptySymbol: false,
                isCircledSymbol: false,
                isUncircledSymbol: false,
                isStartTapeSymbol: false,
                isWriteEmptySymbol: false,
                isWriteNothing: false,
                isCircle: false,
                isUncircle: false,
                symbolToWrite: '',
                direction: 'L'
            };
        }

        /**
         * When the user clicks cancel
         */
        private onCancelClick() {
            // Hides the modal
            this.$bvModal.hide(this.modalID);
        }

        /**
         * When the user clicks add
         */
        private onAddClick() {
            // Adds transition
            this.automata.addTransition(this.transitionSymbol, this.sourceNode._private.data.name, this.targetNode._private.data.name, this.payload);

            // Hides the modal
            this.$bvModal.hide(this.modalID);
        }

        /**
         * When the user clicks edit
         */
        private onEditClick() {
            // Removes existing transition, then add the new one (updates cache too)
            this.automata.removeTransitionWithID(this.transitionID);
            this.onAddClick();
        }

        // ----------------
        // --* Read symbols
        // ----------------

        @Watch('isEpsilonMove')
        private onIsEpsilonMoveChange(val: any, oldVal: any) {
            if (val) {
                this.tmState.isEmptySymbol = false;
                this.tmState.isNonEmptySymbol = false;
                this.tmState.isCircledSymbol = false;
                this.tmState.isUncircledSymbol = false;
                this.tmState.isStartTapeSymbol = false;
            }
        }

        @Watch('tmState.isEmptySymbol')
        private onIsEmptySymbolChange(val: any, oldVal: any) {
            if (val) {
                this.isEpsilonMove = false;
                this.tmState.isNonEmptySymbol = false;
                this.tmState.isCircledSymbol = false;
                this.tmState.isUncircledSymbol = false;
                this.tmState.isStartTapeSymbol = false;
            }
        }

        @Watch('tmState.isNonEmptySymbol')
        private onIsNonEmptySymbolChange(val: any, oldVal: any) {
            if (val) {
                this.isEpsilonMove = false;
                this.tmState.isEmptySymbol = false;
                this.tmState.isCircledSymbol = false;
                this.tmState.isUncircledSymbol = false;
                this.tmState.isStartTapeSymbol = false;
            }
        }

        @Watch('tmState.isCircledSymbol')
        private onIsCircledSymbolChange(val: any, oldVal: any) {
            if (val) {
                this.isEpsilonMove = false;
                this.tmState.isEmptySymbol = false;
                this.tmState.isNonEmptySymbol = false;
                this.tmState.isUncircledSymbol = false;
                this.tmState.isStartTapeSymbol = false;
            }
        }

        @Watch('tmState.isUncircledSymbol')
        private onIsUncircledSymbolChange(val: any, oldVal: any) {
            if (val) {
                this.isEpsilonMove = false;
                this.tmState.isEmptySymbol = false;
                this.tmState.isNonEmptySymbol = false;
                this.tmState.isCircledSymbol = false;
                this.tmState.isStartTapeSymbol = false;
            }
        }

        @Watch('tmState.isStartTapeSymbol')
        private onIsStartTapeSymbolChange(val: any, oldVal: any) {
            if (val) {
                this.isEpsilonMove = false;
                this.tmState.isEmptySymbol = false;
                this.tmState.isNonEmptySymbol = false;
                this.tmState.isCircledSymbol = false;
                this.tmState.isUncircledSymbol = false;
            }
        }

        // ----------------
        // --* TM Write tape symbols
        // ----------------

        @Watch('tmState.isWriteEmptySymbol')
        private onIsWriteEmptySymbolChange(val: any, oldVal: any) {
            if (val) {
                this.tmState.isWriteNothing = false;
                this.tmState.isCircle = false;
                this.tmState.isUncircle = false;
            }
        }

        @Watch('tmState.isWriteNothing')
        private onIsWriteNothingChange(val: any, oldVal: any) {
            if (val) {
                this.tmState.isWriteEmptySymbol = false;
                this.tmState.isCircle = false;
                this.tmState.isUncircle = false;
            }
        }

        @Watch('tmState.isCircle')
        private onIsCircleChange(val: any, oldVal: any) {
            if (val) {
                this.tmState.isWriteEmptySymbol = false;
                this.tmState.isWriteNothing = false;
                this.tmState.isUncircle = false;
            }
        }

        @Watch('tmState.isUncircle')
        private onIsUncircleChange(val: any, oldVal: any) {
            if (val) {
                this.tmState.isWriteEmptySymbol = false;
                this.tmState.isWriteNothing = false;
                this.tmState.isCircle = false;
            }
        }

        // ----------------
        // --* PDA Input stack symbols
        // ----------------

        @Watch('pdaState.isEmptyStackSymbol')
        private onIsEmptyStackSymbolChange(val: any, oldVal: any) {
            if (val)
                this.pdaState.isAnySymbol = false;
        }

        @Watch('pdaState.isAnySymbol')
        private onIsAnySymbolChange(val: any, oldVal: any) {
            if (val)
                this.pdaState.isEmptyStackSymbol = false;
        }
    }
</script>

<style scoped>

</style>
