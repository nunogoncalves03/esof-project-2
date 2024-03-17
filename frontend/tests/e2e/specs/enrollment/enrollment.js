describe('Enrollment', () => {
  beforeEach(() => {
    cy.deleteAllButArs();
    cy.createDemoEntities();
    cy.createDemoActivities();
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
      .should('have.length', 12)
      .eq(3)
      .should('contain', '0');
      
    cy.logout();
  });
});
