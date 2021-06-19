const orm = require('../models');
const { setCurrentUser } = require('./auth');

describe('setCurrentUser middleware', () => {
  const ctx = { orm };

  beforeAll(async () => {
    await ctx.orm.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await ctx.orm.sequelize.close();
  });

  describe('when there is a user logged-in in ctx.state', () => {
    let userData;
    beforeAll(async () => {
      userData = {
        id: 'f1f2b739-7596-4646-a4e5-f388bb754c04',
        firstName: 'TestName',
        lastName: 'TestLastName',
        password: 'randomPassword',
        email: 'sometestemail@test.cl',
      };
      await ctx.orm.user.create(userData);
      ctx.state = {
        authData: {
          sub: userData.id,
        },
      };
      await setCurrentUser(ctx, () => {});
    });

    test('property currentUser is set to state', async () => {
      expect(ctx.state.currentUser).toBeDefined();
    });
    test('property currentUser has the correct firstName', async () => {
      expect(ctx.state.currentUser.firstName).toBe(userData.firstName);
    });
    test('property currentUser has the correct lastName', async () => {
      expect(ctx.state.currentUser.lastName).toBe(userData.lastName);
    });
    test('property currentUser has the correct email', async () => {
      expect(ctx.state.currentUser.email).toBe(userData.email);
    });
  });

  describe('when there is no user logged-in in ctx.state', () => {
    beforeAll(async () => {
      ctx.state = {};
      await setCurrentUser(ctx, () => {});
    });

    test('property currentUser is set to state', async () => {
      expect(ctx.state.currentUser).toBeUndefined();
    });
  });
});
