<template>

    <!-- New tab modal -->
    <b-modal ref="newTabModal">
        <template v-slot:modal-title>
            New Automata
        </template>

        <!-- Body -->
        <b-form @submit="onAddClick">
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
    import ConfigTable from '@/components/ConfigTable.vue';
    import AutomataPreview from '@/components/AutomataPreview.vue';
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

        /**
         * Toggles the modal
         */
        public toggle() {
            // Clears data
            this.type = "FA";
            this.name = "";

            // Toggles the modal
            this.$refs['newTabModal'].toggle("newTabModal");
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
            // Emits event
            this.$emit('add', {
                type: this.type,
                name: this.name ? this.name : "Automata"
            });

            // Hides modal
            this.$refs['newTabModal'].hide("newTabModal");
        }

        /**
         * When the user clicks on 'cancel'
         */
        private onCancelClick() {
            // Hides the modal
            this.$refs['newTabModal'].hide("newTabModal");
        }
    }
</script>

<style scoped>

</style>
