<script lang="ts">
import {Vue, Component, Model} from 'vue-property-decorator';

@Component({})
export default class ParticipationDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;

}
</script>

<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title> Select Participant </v-card-title>
      <v-card-text>
        <v-text-field label="Rating" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="blue-darken-1"
            variant="text"
            @click="$emit('close-participation-dialog')"
        >
          Close
        </v-btn>
        <v-btn
            color="blue-darken-1"
            variant="text"
            @click=""
            data-cy=""
        >
          Make Participant
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>