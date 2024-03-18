<template>
  <div>
    <v-card class="table">
      <v-data-table
        :headers="headers"
        :items="activities"
        :search="search"
        disable-pagination
        :hide-default-footer="true"
        :mobile-breakpoint="0"
        data-cy="volunteerActivitiesTable"
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
          </v-card-title>
        </template>
        <template v-slot:[`item.themes`]="{ item }">
          <v-chip v-for="theme in item.themes" v-bind:key="theme.id">
            {{ theme.completeName }}
          </v-chip>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip v-if="item.state === 'APPROVED'" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="red"
                v-on="on"
                data-cy="reportButton"
                @click="reportActivity(item)"
                >warning</v-icon
              >
            </template>
            <span>Report Activity</span>
          </v-tooltip>
          <v-tooltip v-if="canEnrollInActivity(item)" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="blue"
                v-on="on"
                data-cy="applyButton"
                @click="() => createEnrollment(item.id)"
                >mdi-login</v-icon
              >
            </template>
            <span>Apply for Activity</span>
          </v-tooltip>
          <v-tooltip v-if="canAssessInstitution(item)" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="blue"
                v-on="on"
                data-cy="assessButton"
                @click="assessInstitution(item)"
                >mdi-file-document-edit</v-icon
              >
            </template>
            <span>Write Assessment</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <enrollment-dialog
        v-if="createEnrollmentDialog && activityId"
        v-model="createEnrollmentDialog"
        :activityId="activityId"
        v-on:close-enrollment-dialog="onCloseEnrollmentDialog"
        v-on:create-enrollment="onCreateEnrollment"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import EnrollmentDialog from '@/views/volunteer/EnrollmentDialog.vue';
import { show } from 'cli-cursor';
import Assessment from "@/models/assessment/Assessment";
import Participation from "@/models/participation/Participation";

@Component({
  methods: { show },
  components: {
    'enrollment-dialog': EnrollmentDialog,
  },
})
export default class VolunteerActivitiesView extends Vue {
  activities: Activity[] = [];
  enrollments: Enrollment[] = [];
  assessments: Assessment[] = [];
  participations: Participation[] = [];
  search: string = '';

  activityId: number | null = null;
  createEnrollmentDialog: boolean = false;

  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Themes',
      value: 'themes',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activities = await RemoteServices.getActivities();
      this.enrollments = await RemoteServices.getVolunteerEnrollments();
      this.assessments = await RemoteServices.getVolunteerAssessments();
      this.participations = await RemoteServices.getVolunteerParticipations();
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  createEnrollment(activityId: number) {
    this.activityId = activityId;
    this.createEnrollmentDialog = true;
  }

  onCloseEnrollmentDialog() {
    this.activityId = null;
    this.createEnrollmentDialog = false;
  }

  onCreateEnrollment(enrollment: Enrollment) {
    this.activityId = null;
    this.createEnrollmentDialog = false;
    this.enrollments.push(enrollment);
  }

  canEnrollInActivity(activity: Activity): boolean {
    // wait for the get enrollments request to finish
    if (this.$store.getters.getLoading) {
      return false;
    }
    
    return (
      activity.applicationDeadline > new Date().toISOString() &&
      !this.enrollments.some(
        (enrollment) => enrollment.activityId === activity.id,
      )
    );
  }

  async reportActivity(activity: Activity) {
    if (activity.id !== null) {
      try {
        const result = await RemoteServices.reportActivity(
          this.$store.getters.getUser.id,
          activity.id,
        );
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.activities.unshift(result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }

  canAssessInstitution(activity: Activity): boolean {
    return (activity.endingDate < new Date().toISOString() &&
      !this.assessments.some((assessment) => assessment.institutionId === activity.institution.id)) &&
      this.participations.some((participation) => participation.activityId === activity.id)
  };
}
</script>

<style lang="scss" scoped></style>
