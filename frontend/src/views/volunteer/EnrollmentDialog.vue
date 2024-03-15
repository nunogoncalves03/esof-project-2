<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card>
      <v-card-title>
        <span class="headline">New Enrollment</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="*Motivation"
                :rules="[(v) => !!v || 'Enrollment motivation is required']"
                required
                v-model="newEnrollment.motivation"
                data-cy="motivationInput"
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
          @click="$emit('close-enrollment-dialog')"
        >
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" data-cy="createEnrollment">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Model } from 'vue-property-decorator';
import Enrollment from '@/models/enrollment/Enrollment';
import RemoteServices from '@/services/RemoteServices';
import { ISOtoString } from '@/services/ConvertDateService';

@Component({
  methods: { ISOtoString },
})
export default class EnrollmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;

  newEnrollment: Enrollment = new Enrollment();

  cypressCondition: boolean = false;

  async created() {
    this.newEnrollment = new Enrollment();
  }

  async createEnrollment() {
    // TODO
  }
}
</script>

<style scoped lang="scss"></style>
