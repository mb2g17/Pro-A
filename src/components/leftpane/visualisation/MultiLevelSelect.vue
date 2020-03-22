<template>

    <div id="multilevel-exploration">
        <b-form-checkbox
                class="mt-2"
                v-model="isMultilevelExplorationEnabled"
                :value="true"
                :unchecked-value="false"
        >
            Multi-level exploration: {{ isMultilevelExplorationEnabled ? `Level ${level}` : `Disabled` }}
        </b-form-checkbox>
        <b-form-input :disabled="!isMultilevelExplorationEnabled"
                      type="range"
                      min="0"
                      max="20"
                      v-model.number="inputNumber"
                      placeholder="Abstraction level"/>
    </div>

</template>

<script lang="ts">
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    @Component
    export default class MultiLevelSelect extends Vue {
        /** If true, user wants to perform multi-level exploration */
        private isMultilevelExplorationEnabled: boolean = false;

        /** Number on the input box */
        private inputNumber: number = 0;

        /** Returns the level at which to perform multi-level exploration on, -1 means disabled */
        public get level(): number {
            return this.isMultilevelExplorationEnabled ? this.inputNumber : -1;
        }

        @Watch("level")
        private onLevelChange(val: number, oldVal: number) {
            this.$emit("multiLevelExplore", this.level);
        }
    }
</script>

<style scoped>

</style>