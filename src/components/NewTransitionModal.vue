<template>

    <!-- New transition modal -->
    <b-modal :id="modalID" v-model="isModalVisible">
        <template v-slot:modal-title>
            New Transition ({{ automataType }})
        </template>

        <!-- Body -->
        <b-form @submit="">
            <!-- Transition symbol -->
            <b-form-group :label="`Transition symbol: ${transitionSymbol}`">
                <b-form-input v-model="inputtedTransitionSymbol" placeholder="a" :disabled="isEpsilonMove || tmState.isEmptySymbol"></b-form-input>
            </b-form-group>

            <!-- Special transition symbols -->
            <b-form-group>
                <b-form-checkbox v-model="isEpsilonMove">Epsilon move</b-form-checkbox>
                <b-form-checkbox v-model="tmState.isEmptySymbol" v-if="automataType === 'TM'">Empty symbol</b-form-checkbox>
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
                <b-form-group :label="`Symbol to write:`">
                    <b-form-input v-model="tmState.symbolToWrite" placeholder="a"></b-form-input>
                </b-form-group>

                <!-- Direction -->
                <b-form-group :label="`Direction: ${tmState.direction}`">
                    <b-form-radio-group
                            v-model="tmState.direction"
                            :options="[{text: 'L(eft)', value: 'L'}, {text: 'R(ight)', value: 'R'}]"
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
                <b-button variant="primary" class="float-right" @click="onAddClick">Add</b-button>
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

    @Component
    export default class NewTransitionModal extends Vue {

        /** The automata being modelled */
        @Prop() public readonly automata!: Automata;

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
            symbolToWrite: '',
            direction: 'L'
        };

        /** If true, this is an epsilon move. False if not */
        private isEpsilonMove: boolean = false;

        /** Stores source node of this new transition */
        private sourceNode: any;

        /** Stores target node of this new transition */
        private targetNode: any;

        mounted() {
            this.modalID = uuid(); // Sets random modal ID
        }

        /**
         * The real transition symbol
         */
        get transitionSymbol() {
            // Epsilon move
            if (this.isEpsilonMove)
                return /*'ε'*/'__epsilon';

            if (this.tmState.isEmptySymbol)
                return '__empty';

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
                return "__empty";
            if (this.pdaState.isAnySymbol)
                return null;
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
                    writeTapeSymbol: this.tmState.symbolToWrite,
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
         * Shows the modal
         */
        public show(sourceNode: any, targetNode: any) {
            // Stores data
            this.sourceNode = sourceNode;
            this.targetNode = targetNode;

            // Clears data
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
                symbolToWrite: '',
                direction: 'L'
            };

            // Shows the modal
            this.$bvModal.show(this.modalID);
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

        @Watch('isEpsilonMove')
        private onIsEpsilonMoveChange(val: any, oldVal: any) {
            if (val)
                this.tmState.isEmptySymbol = false;
        }

        @Watch('tmState.isEmptySymbol')
        private onIsEmptySymbolChange(val: any, oldVal: any) {
            if (val)
                this.isEpsilonMove = false;
        }

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