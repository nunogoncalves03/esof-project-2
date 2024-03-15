<template>
  <v-dialog v-model="dialog" persistent width="600">
    <v-card>
      <v-card-title>
        <span class="headline">New Application</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit="createEnrollment">
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="*Motivation"
                :rules="[
                  (v) => !!v || 'Motivation is required',
                  (v) =>
                    isMotivationValid(v) ||
                    'Motivation needs to have at least 10 characters',
                ]"
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
        <v-btn
          v-if="canCreate()"
          color="blue-darken-1"
          variant="text"
          @click="createEnrollment"
          data-cy="createEnrollment"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Enrollment from '@/models/enrollment/Enrollment';
import RemoteServices from '@/services/RemoteServices';
import { ISOtoString } from '@/services/ConvertDateService';

@Component({
  methods: { ISOtoString },
})
export default class EnrollmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Number, required: true }) readonly activityId!: number;

  newEnrollment: Enrollment = new Enrollment();

  cypressCondition: boolean = false;

  async created() {
    this.newEnrollment = new Enrollment();
    this.newEnrollment.activityId = this.activityId;
  }

  isMotivationValid(motivation?: string) {
    if (!motivation) {
      return false;
    }
    return motivation.length >= 10;
  }

  canCreate(): boolean {
    return this.isMotivationValid(this.newEnrollment.motivation);
  }

  get canSave() {
    return this.cypressCondition || this.canCreate();
  }

  async createEnrollment(e?: SubmitEvent) {
    if (e) {
      // prevent default form submission behaviour (page reload)
      e.preventDefault();
    }

    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        const result = await RemoteServices.registerEnrollment(
          this.newEnrollment,
        );
        this.$emit('create-enrollment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
