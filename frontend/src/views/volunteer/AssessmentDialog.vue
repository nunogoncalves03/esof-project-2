<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card>
      <v-card-title>
        <span class="headline">New Assessment</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="*Review"
                :rules="[(r) => r.length >= 10 || 'Assessment review is required']"
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
        <v-btn color="blue-darken-1" variant="text" data-cy="assessInstitution">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Model } from 'vue-property-decorator';
import Assessment from '@/models/assessment/Assessment';
import RemoteServices from '@/services/RemoteServices';
import { ISOtoString } from '@/services/ConvertDateService';

@Component({
  methods: { ISOtoString },
})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;

  newAssessment: Assessment = new Assessment();

  cypressCondition: boolean = false;

  async created() {
    this.newAssessment = new Assessment();
  }

  async assessmentInstitution() {
    // TODO
  }
}
</script>

<style scoped lang="scss"></style>