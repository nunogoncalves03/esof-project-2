<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card>
      <v-card-title>
        <span class="headline">New Assessment</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit="assessInstitution">
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="*Review"
                :rules="[
                  (v) => !!v || 'Review is required',
                  (v) =>
                    validReview(v) ||
                    'Review needs to have at least 10 characters',
                ]"
                required
                v-model="newAssessment.review"
                data-cy="reviewInput"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="$emit('close-assessment-dialog')"
        >
          Close
        </v-btn>
        <v-btn
          v-if="canCreate()"
          color="blue-darken-1"
          variant="text"
          @click="assessInstitution"
          data-cy="assessInstitution"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import {Vue, Component, Model, Prop} from 'vue-property-decorator';
import Assessment from '@/models/assessment/Assessment';
import RemoteServices from '@/services/RemoteServices';
import { ISOtoString } from '@/services/ConvertDateService';

@Component({
  methods: { ISOtoString },
})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type : Number, required: true }) readonly institutionId!: number;

  newAssessment: Assessment = new Assessment();

  cypressCondition: boolean = false;

  validReview(review?: string) {
    if (!review)
        return false;
    return review.length >= 10;
  }

  canCreate(): boolean {
    return this.validReview(this.newAssessment.review);
  }

  async created() {
    this.newAssessment = new Assessment();
    this.newAssessment.institutionId = this.institutionId;
  }

  async assessInstitution(e?: SubmitEvent) {
    if (e) {
      e.preventDefault();
    }

    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        const result = await RemoteServices.registerAssessment(
          this.newAssessment,
        );
        this.$emit('create-assessment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>