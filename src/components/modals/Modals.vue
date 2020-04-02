<template>
    <div id="modals">

        <!-- New tab modal -->
        <NewTabModal ref="newTabModal" />

        <!-- New transition modal -->
        <NewTransitionModal ref="newTransitionModal" />

        <!-- Styles modal -->
        <StylesModal ref="stylesModal"></StylesModal>

    </div>
</template>

<script lang="ts">
    import ModalsEventHandler from "@/events/ModalsEventHandler";
    import {Component} from "vue-property-decorator";
    import Vue from "vue";
    import NewTabModal from "@/components/modals/NewTabModal.vue";
    import NewTransitionModal from "@/components/modals/NewTransitionModal.vue";
    import StylesModal from "@/components/modals/styles/StylesModal.vue";

    @Component({
        components: {
            NewTabModal, NewTransitionModal, StylesModal
        }
    })
    export default class Modals extends Vue {
        /** New tab modal reference */
        private newTabModal: any;

        /** New transition modal reference */
        private newTransitionModal: any;

        /** Styles modal reference */
        private stylesModal: any;

        private mounted() {
            // Stores references for convenience
            this.newTabModal = this.$refs["newTabModal"];
            this.newTransitionModal = this.$refs["newTransitionModal"];
            this.stylesModal = this.$refs["stylesModal"];

            // --* EVENTS *--
            // When the user wants to create a new automata
            ModalsEventHandler.$on("onNewAutomata", (callback: (type: string, name: string) => void) => {
                // Runs modal
                this.newTabModal.show((type: string, name: string) => {
                    callback(type, name);
                });
            });

            // When the user wants to create a new transition
            ModalsEventHandler.$on("onNewTransition", (args: any) => {
                // Deconstructs arguments and runs modal
                const {automataType, existingSymbols, callback} = args;
                this.newTransitionModal.show(automataType, existingSymbols, callback);
            });

            // When the user wants to edit a transition
            ModalsEventHandler.$on("onEditTransition", (args: any) => {
                // Deconstructs arguments and runs modal
                const {automataType, existingSymbols, transition, callback} = args;
                this.newTransitionModal.showEdit(automataType, existingSymbols, transition, callback);
            });

            // When the user wants to change styles
            ModalsEventHandler.$on("onStylesChange", (args: any) => {
                this.stylesModal.show();
            });
        }
    }
</script>

<style scoped>

</style>