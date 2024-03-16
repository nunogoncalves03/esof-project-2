<template>
  <v-card class="table">
    <div class="text-h3">{{ activity.name }}</div>
    <v-data-table
      :headers="headers"
      :items="enrollments"
      :search="search"
      disable-pagination
      :hide-default-footer="true"
      :mobile-breakpoint="0"
      data-cy="activityEnrollmentsTable"
    >
      <template v-slot:top>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            class="mx-2"
          />
          <v-spacer />
          <v-btn
            color="primary"
            dark
            @click="getActivities"
            data-cy="getActivities"
            >Activities</v-btn
          >
        </v-card-title>
      </template>
      <template v-slot:[`item.participating`]="{ item }">
        <v-icon>{{ isParticipating(item) ? 'mdi-check' : 'mdi-close' }}</v-icon>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip v-if="canParticipateInActivity(item)" bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mr-2 action-button"
              v-on="on"
              @click="() => createParticipation(item.volunteerId)"
            >
              mdi-check
            </v-icon>
          </template>
          <span>Select Participant</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <participation-dialog
      v-if="createParticipationDialog"
      v-model="createParticipationDialog"
      :activityId="activity.id"
      :volunteerId="volunteerId"
      v-on:close-participation-dialog="closeParticipationDialog"
      v-on:create-participation="onCreateParticipation"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import Participation from '@/models/participation/Participation';
import ParticipationDialog from '@/views/member/ParticipationDialog.vue';

@Component({
  components: {
    'participation-dialog': ParticipationDialog,
  },
})
export default class InstitutionActivityEnrollmentsView extends Vue {
  activity!: Activity;
  enrollments: Enrollment[] = [];
  participations: Participation[] = [];
  search: string = '';

  volunteerId: number | null = null;
  createParticipationDialog: boolean = false;

  headers: object = [
    {
      text: 'Name',
      value: 'volunteerName',
      align: 'left',
      width: '20%',
    },
    {
      text: 'Motivation',
      value: 'motivation',
      align: 'left',
      width: '50%',
    },
    {
      text: 'Participating',
      value: 'participating',
      sortable: false,
      align: 'left',
      width: '10%',
    },
    {
      text: 'Application Date',
      value: 'enrollmentDateTime',
      align: 'left',
      width: '10%',
    },
    {
      text: 'Actions',
      value: 'actions',
      sortable: false,
      align: 'left',
      width: '5%',
    },
  ];

  async created() {
    this.activity = this.$store.getters.getActivity;
    if (this.activity !== null && this.activity.id !== null) {
      await this.$store.dispatch('loading');
      try {
        this.enrollments = await RemoteServices.getActivityEnrollments(
          this.activity.id,
        );
        this.participations = await RemoteServices.getActivityParticipations(
          this.activity.id,
        );
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
      await this.$store.dispatch('clearLoading');
    }
  }

  createParticipation(volunteerId: number) {
    this.volunteerId = volunteerId;
    this.createParticipationDialog = true;
  }
  onCreateParticipation(Participation: Participation) {
    this.createParticipationDialog = false;
    this.participations.push(Participation);
    this.enrollments = this.enrollments.filter(
      (e) => e.volunteerId !== Participation.volunteerId,
    );
  }

  closeParticipationDialog() {
    this.createParticipationDialog = false;
  }

  async getActivities() {
    await this.$store.dispatch('setActivity', null);
    this.$router.push({ name: 'institution-activities' }).catch(() => {});
  }

  isParticipating(enrollment: Enrollment): boolean {
    return this.participations.some(
      (p) => p.volunteerId === enrollment.volunteerId,
    );
  }

  canParticipateInActivity(enrollment: Enrollment): boolean {
    return (
      !this.participations.some(
        (p) => p.volunteerId === enrollment.volunteerId,
      ) && this.participations.length < this.activity.participantsNumberLimit
    );
  }
}
</script>

<style lang="scss" scoped>
.date-fields-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-fields-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>
