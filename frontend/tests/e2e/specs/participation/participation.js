describe('Participation', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createDemoEntitiesForParticipationTest();
        cy.createDemoActivitiesForParticipationTest();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create participation', () => {
        const NOT_PARTICIPATING = 'false';
        const PARTICIPATING = 'true';
        const RATING_1 = '1';
        const NUM_PARTICIPATIONS_1 = '1';
        const NUM_PARTICIPATIONS_2 = '2';

        cy.demoMemberLogin();

        // intercept create participation request and inject date values in the request body
        cy.intercept('POST', '/activities/*/participations').as('create');

        // intercept get institutions
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        cy.intercept('GET', '/activities/*/enrollments').as('showEnrollments');

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 2) // check if activity table has 2 instances
            .eq(0)
            .children()
            .eq(3)
            .should('contain', NUM_PARTICIPATIONS_1); // check if first activity has 1 participation

        // select show enrollments on first activity
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(11)
            .parent()
            .find('[data-cy="showEnrollments"]')
            .click();

        cy.wait('@showEnrollments');

        // check if activity enrollments table has 2 instances
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should('have.length', 2)
            .eq(0)
            .children()
            .eq(2)
            .should('contain', NOT_PARTICIPATING); // check if first enrollment has Participating column set to 'false'

        // create participation with that enrollment
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(4)
            .parent()
            .find('[data-cy="createParticipation"]')
            .click();

        cy.get('[data-cy="ratingInput"]').type(RATING_1);   // input rating

        cy.get('[data-cy="saveParticipation"]').click();

        cy.wait('@create')

        // check if first enrollment participating has changed to true
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(2)
            .should('contain', PARTICIPATING); // check if first enrollment has Participating column set to 'false'

        // go back to activity table and check if there are 2 participations
        cy.get('[data-cy="getActivities"]').click();
        cy.wait('@getInstitutions');

        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 2) // check if activity table has 2 instances
            .eq(0)
            .children()
            .eq(2)
            .should('contain', NUM_PARTICIPATIONS_2); // check if first activity now has 2 participations*/

        cy.logout();
    });
});
