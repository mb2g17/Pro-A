<template>
    <!-- Operations -->
    <div id="operations">

        <OperationButton name="State fold"
                         max-stages=1
                         variant="warning"
                         :success-message-enabled="false"
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onStateFoldCompute', $event)"
        ></OperationButton>

        <OperationButton name="Duplicate"
                         max-stages=1
                         :success-message-enabled="false"
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onDuplicateCompute', $event)"
        ></OperationButton>

        <OperationButton name="Union"
                         max-stages=2
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onUnionCompute', $event)"
        ></OperationButton>

        <OperationButton name="Concatenation"
                         max-stages=2
                         v-if="automataTypeEnabled('pushdown')"
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onConcatenationCompute', $event)"
        ></OperationButton>

        <OperationButton name="Kleene star"
                         max-stages=1
                         v-if="automataTypeEnabled('pushdown')"
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onKleeneStarCompute', $event)"
        ></OperationButton>

        <OperationButton name="Product"
                         max-stages=2
                         v-if="automataTypeEnabled('finite')"
                         @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                         @onOperationCompute="$emit('onProductCompute', $event)"
        ></OperationButton>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Vue from "vue";
    import Automata from "@/classes/Automata";
    import OperationButton from "@/components/leftpane/computation/OperationButton.vue";
    import FiniteAutomata from "@/classes/FiniteAutomata";
    import PushdownAutomata from "@/classes/PushdownAutomata";
    @Component({
        components: {OperationButton}
    })
    export default class ComputationPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        private automataTypeEnabled(type: string): boolean {
            if (type === "finite") {
                return this.automata instanceof FiniteAutomata;
            }
            else if (type === "pushdown") {
                return this.automata instanceof FiniteAutomata ||
                        this.automata instanceof PushdownAutomata;
            }
            return true;
        }
    }
</script>

<style lang="scss" scoped>
    #operations {
        display:flex;
        flex-direction: column;
    }
</style>