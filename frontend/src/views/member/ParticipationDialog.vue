<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title> Select Participant </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit="createParticipation">
          <v-text-field
            label="Rating"
            :rules="[
              (v) => isRatingValid(v) || 'Rating must be empty or between 1 and 5',
            ]"
            v-model="newParticipation.rating"
            data-cy="ratingInput"
          ></v-text-field>
        </v-form>
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
          @click="createParticipation"
          data-cy="createParticipation"
        >
          Make Participant
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator';
import Participation from '@/models/participation/Participation';
import { ISOtoString } from '@/services/ConvertDateService';
import RemoteServices from '@/services/RemoteServices';

@Component({
  methods: { ISOtoString },
})
export default class ParticipationDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Number, required: true }) readonly activityId!: number;
  @Prop({ type: Number, required: true }) readonly volunteerId!: number;

  newParticipation: Participation = new Participation();

  async created() {
    this.newParticipation = new Participation();
    this.newParticipation.activityId = this.activityId;
    this.newParticipation.volunteerId = this.volunteerId;
  }
  isRatingValid(value: any) {
    if (value === null || value === undefined || value === '') return true;
    if (!/^\d+$/.test(value)) return false;
    const parsedValue = parseInt(value);
    return parsedValue >= 1 && parsedValue <= 5;
  }
  async createParticipation() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        const result = await RemoteServices.createParticipation(
          this.newParticipation,
        );
        this.$emit('create-participation', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
