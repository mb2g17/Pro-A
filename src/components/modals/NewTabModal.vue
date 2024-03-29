<template>

    <!-- New tab modal -->
    <b-modal ref="newTabModal" v-model="isModalVisible">
        <template v-slot:modal-title>
            New Automata
        </template>

        <!-- Body -->
        <b-form @submit="">
            <b-form-group :label="`Automata type: ${getAutomataName()}`">
                <b-button-group>
                    <b-button variant="primary" :disabled="type === 'FA'" @click="onTypeClick('FA')">Finite Automata</b-button>
                    <b-button variant="primary" :disabled="type === 'PDA'" @click="onTypeClick('PDA')">Pushdown Automata</b-button>
                    <b-button variant="primary" :disabled="type === 'TM'" @click="onTypeClick('TM')">Turing Machine</b-button>
                </b-button-group>
            </b-form-group>

            <b-form-group :label="`Automata name: ${name ? name : 'Automata'}`">
                <b-form-input v-model="name" placeholder="Automata"></b-form-input>
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
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import ConfigTable from '@/components/rightpane/animation/ConfigTable.vue';
    import AutomataPreview from '@/components/middlepane/AutomataPreview.vue';
    import {
        BButton, BButtonGroup,
        BCol,
        BContainer,
        BForm,
        BFormInput,
        BFormTextarea,
        BModal,
        BRow,
        BTab,
        BTabs
    } from 'bootstrap-vue';
    import TabBody from '@/components/TabBody.vue';
    import $ from 'jquery';

    @Component({
        components: {
            BForm, BFormInput, BFormTextarea, BModal
        },
    })
    export default class NewTabModal extends Vue {
        /** Type of automata selected */
        private type: string = "FA";

        /** Name of automata inputted */
        private name: string = "";

        /** If true, modal is visible. If false, it is not */
        private isModalVisible: boolean = false;

        /** Callback function to run when new automata has been "created" */
        private callback!: (type: string, name: string) => void;

        mounted() {
            // Hacky jQuery event that creates automata upon 'enter' keypress
            $(document).on('keypress', e => {
                // If user pressed enter *and* modal is visibile, add automata
                if (e.key === "Enter" && this.isModalVisible)
                    this.onAddClick();
            });
        }

        /**
         * Shows the modal
         */
        public show(callback: (type: string, name: string) => void) {
            // Clears data
            this.type = "FA";
            this.name = "";

            // Sets callback
            this.callback = callback;

            // Shows the modal
            (this.$refs['newTabModal'] as any).show();
        }

        /**
         * Gets automata proper name from type
         */
        private getAutomataName() {
            switch (this.type) {
                case 'FA':
                    return "Finite Automata";
                case 'PDA':
                    return "Pushdown Automata";
                case 'TM':
                    return "Turing Machine";
                default:
                    return "Invalid type";
            }
        }

        /**
         * When the user clicks on a type
         * @param type - the type that the user clicked on
         */
        private onTypeClick(type: string) {
            this.type = type;
        }

        /**
         * When the user clicks on 'add'
         */
        private onAddClick() {
            // Runs callback
            this.callback(this.type, this.name ? this.name : "Automata");

            // Hides modal
            (this.$refs['newTabModal'] as any).hide();
        }

        /**
         * When the user clicks on 'cancel'
         */
        private onCancelClick() {
            // Hides the modal
            (this.$refs['newTabModal'] as any).hide();
        }
    }
</script>

<style scoped>

</style>
