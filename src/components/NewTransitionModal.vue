<template>

    <!-- New transition modal -->
    <b-modal :id="modalID" v-model="isModalVisible">
        <template v-slot:modal-title>
            New Transition
        </template>

        <!-- Body -->
        <b-form @submit="">
            <!-- Transition symbol -->
            <b-form-group :label="`Transition symbol: ${transitionSymbol}`">
                <b-form-input v-model="inputtedTransitionSymbol" placeholder="a" :disabled="isEpsilonMove"></b-form-input>
            </b-form-group>

            <!-- Special transition symbols -->
            <b-form-group>
                <b-form-checkbox v-model="isEpsilonMove">Epsilon move</b-form-checkbox>
            </b-form-group>

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
    import {Component, Prop} from 'vue-property-decorator';
    import Automata from "@/classes/Automata";

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

            // Default value
            if (this.inputtedTransitionSymbol)
                return this.inputtedTransitionSymbol;
            else
                return 'a';
        }

        /**
         * The payload needed to pass into the automata method
         */
        get payload() {
            return {};
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
    }
</script>

<style scoped>

</style>