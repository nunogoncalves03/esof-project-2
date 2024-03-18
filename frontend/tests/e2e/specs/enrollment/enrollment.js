describe('Enrollment', () => {
  beforeEach(() => {
    cy.deleteAllButArs();
    cy.createDemoEntities();
    cy.createDemoActivitiesForEnrollmentTest();
  });

  afterEach(() => {
    cy.deleteAllButArs();
  });

  it('create enrollment', () => {
    const MOTIVATION = "sql-inserted-motivation"

    cy.demoMemberLogin()

    // intercept get institution request
    cy.intercept('GET', '/users/*/getInstitution').as('getInstitution');

    // go to activities table
    cy.get('[data-cy="institution"]').click();
    cy.get('[data-cy="activities"]').click();
    cy.wait('@getInstitution');

    // check results
    cy.get('[data-cy="memberActivitiesTable"] tbody tr')
      .should('have.length', 3)
      .eq(0)
      .children()
      .should('have.length', 13)
      .eq(3)
      .should('contain', '0');
      
    cy.logout();

    cy.demoVolunteerLogin();

    // intercept get activities request
    cy.intercept('GET', '/activities').as('getActivities');
    // intercept get volunteer enrollments request
    cy.intercept('GET', '/enrollments/volunteer').as('getVolunteerEnrollments');
    // go to volunteer activities view
    cy.get('[data-cy="volunteerActivities"]').click();
    // check requests were done
    cy.wait('@getActivities');
    cy.wait('@getVolunteerEnrollments');

    // go to apply button
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
      .should('have.length', 3)
      .eq(0)
      .children()
      .find('[data-cy="applyButton"]')
      .click();

    // intercept create enrollment request
    cy.intercept('POST', '/activities/*/enrollments').as('createEnrollment');

    // fill form
    cy.get('[data-cy="motivationInput"]').type(MOTIVATION);
    cy.get('[data-cy="createEnrollment"]').click();
    
    cy.wait("@createEnrollment");

    // check that it is not possible to enroll anymore
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
    .eq(0)
    .children()
    .find('[data-cy="applyButton"]')
    .should('not.exist');

    cy.logout();

    cy.demoMemberLogin();

    // go to activities table
    cy.get('[data-cy="institution"]').click();
    cy.get('[data-cy="activities"]').click();
    cy.wait('@getInstitution');

    cy.intercept('GET', '/activities/*/enrollments').as('getActivityEnrollments');

    // check number of applications and navigate to activity's enrollments
    cy.get('[data-cy="memberActivitiesTable"] tbody tr')
      .should('have.length', 3)
      .eq(0)
      .children()
      .should('have.length', 13)
      .eq(3)
      .should('contain', '1')
      .parent()
      .find('[data-cy="showEnrollments"]')
      .click()

    cy.wait('@getActivityEnrollments');

    // check activity's enrollments
    cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
      .should('have.length', 1)
      .eq(0)
      .children()
      .eq(1)
      .should('contain', MOTIVATION);
      
    cy.logout();
  });
});
