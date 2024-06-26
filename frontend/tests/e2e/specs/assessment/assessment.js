describe('Assessment', () => {
  beforeEach(() => {
    cy.deleteAllButArs();
    cy.createDemoEntities();
    cy.createDemoEntitiesForAssessmentTest();
  });

  afterEach(() => {
    cy.deleteAllButArs();
  });

  it('create assessment', () => {

    const REVIEW = "0123456789";
    
    // logging in as a volunteer
    cy.demoVolunteerLogin();

    // intercept get activities request
    cy.intercept('GET', '/activities').as('getActivities');
    // intercept get enrollments request
    cy.intercept('GET', '/enrollments/volunteer').as('getEnrollments');
    // intercept get assessments request
    cy.intercept('GET', '/assessments/volunteer').as('getAssessments');
    // intercept get participations request
    cy.intercept('GET', '/participations/volunteer').as('getParticipations');
    // go to volunteer activities view
    cy.get('[data-cy="volunteerActivities"]').click();
    // wait for requests to be done
    cy.wait('@getActivities');
    cy.wait('@getEnrollments');
    cy.wait('@getAssessments');
    cy.wait('@getParticipations');

    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
      .should('have.length', 6) // checking that the activities table has 6 instances
      .eq(0)
      .children()
      .eq(0)
      .should('contain', 'A1') // checking that the first activity is named 'A1'

    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
    .eq(0)
    .find('[data-cy="assessButton"]')
    .click(); // assess the first activity

    // intercept create assessment request
    cy.intercept('POST', '/institutions/*/assessments').as('createAssessment');

    // filling the form
    cy.get('[data-cy="reviewInput"]').type(REVIEW);
    cy.get('[data-cy="assessInstitution"]').click();
    
    cy.wait("@createAssessment");

    // checking that it is not possible to assess the first activity anymore
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
    .eq(0)
    .children()
    .find('[data-cy="assessButton"]')
    .should('not.exist');

    cy.logout();

    // logging in as a member
    cy.demoMemberLogin();

    // intercept get institutions and get institution assessments requests
    cy.intercept('GET', '/users/*/getInstitution').as('getInstitution');
    cy.intercept('GET', '/institutions/*/assessments').as('getAssessments');
    // go to assessments table
    cy.get('[data-cy="institution"]').click();
    cy.get('[data-cy="assessments"]').click();
    // wait for requests to be done
    cy.wait('@getInstitution');
    cy.wait('@getAssessments');

    // check results
    cy.get('[data-cy="institutionAssessmentsTable"] tbody tr')
      .should('have.length', 1) // only one assessment created
      .eq(0)
      .children()
      .eq(0)
      .should('contain', REVIEW) // checking that the review has the correct text
      
    cy.logout();
  });
});