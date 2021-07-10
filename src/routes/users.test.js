const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Users routes', () => {
  let auth;
  let loggedInUser;
  let loggedOutUser;
  let userFields = {
    id: uuid(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@user.cl',
    password: 'testPassword',
  };
  const user2Fields = {
    id: uuid(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test2@user.cl',
    password: 'testPassword',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    loggedInUser = await app.context.orm.user.create(userFields);
    loggedOutUser = await app.context.orm.user.create(user2Fields);
    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /api/users', () => {
    describe('Successful creation of user', () => {
      let createResponse;
      const userData = {
        firstName: 'Test Create',
        lastName: 'User',
        email: 'test_create@user.cl',
        password: 'testPassword',
      };
      beforeAll(async () => {
        createResponse = await request
          .post('/api/users')
          .set('Content-type', 'application/json')
          .send(userData);
      });
      test('responds with 201 status code', async () => {
        expect(createResponse.status).toBe(201);
      });
      test('responds with a json body type', async () => {
        expect(createResponse.type).toEqual('application/json');
      });
      test('responds body has correct user email', async () => {
        expect(createResponse.body.email).toEqual(userData.email);
      });
      test('responds body does not contain the password', async () => {
        expect(createResponse.body.password).toEqual(undefined);
      });
      test('resource is available in database', async () => {
        const newUser = await app.context.orm.user.findByPk(
          createResponse.body.id,
        );
        expect(createResponse.body.id).toEqual(newUser.id);
      });
    });

    describe('Failing creation of user', () => {
      test('email already in use', async () => {
        const userData = {
          firstName: 'Test Create',
          lastName: 'User',
          email: 'test@user.cl',
          password: 'testPassword',
        };
        const createResponse = await request
          .post('/api/users')
          .set('Content-type', 'application/json')
          .send(userData);
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
        expect(createResponse.body.errors[0].message).toBe('email must be unique');
      });
      test('firstName must be sent', async () => {
        const userData = {
          lastName: 'User',
          email: 'new_email@user.cl',
          password: 'testPassword',
        };
        const createResponse = await request
          .post('/api/users')
          .set('Content-type', 'application/json')
          .send(userData);
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
        expect(createResponse.body.errors[0].message).toBe('user.firstName cannot be null');
      });
    });
  });

  describe('GET /api/users', () => {
    const authorizedGetUser = () => request
      .get('/api/users')
      .auth(auth.accessToken, { type: 'bearer' });

    describe('when a user is logged-in, a list of users is retrieved', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetUser(loggedInUser.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('response contains at least the logged-in user', async () => {
        const filteredData = response.body.filter((user) => user.id === loggedInUser.id);
        expect(filteredData.length).toEqual(1);
      });
    });
  });

  describe('GET /api/users/me', () => {
    const authorizedGetUser = () => request
      .get('/api/users/me')
      .auth(auth.accessToken, { type: 'bearer' });

    describe('only a logged-in user can retrive its information', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetUser(loggedInUser.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('responds body has correct user id', async () => {
        expect(response.body.id).toEqual(loggedInUser.id);
      });
      test('responds body has correct user email', async () => {
        expect(response.body.email).toEqual(loggedInUser.email);
      });
      test('responds body does not contain the password', async () => {
        expect(response.body.password).toEqual(undefined);
      });
    });
  });

  describe('GET /api/users/:id', () => {
    const authorizedGetUser = (id) => request
      .get(`/api/users/${id}`)
      .auth(auth.accessToken, { type: 'bearer' });

    describe('when passed, id corresponds to an existing user', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetUser(loggedOutUser.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('responds body has correct user id', async () => {
        expect(response.body.id).toEqual(loggedOutUser.id);
      });
      test('responds body has correct user email', async () => {
        expect(response.body.email).toEqual(loggedOutUser.email);
      });
      test('responds body does not contain the password', async () => {
        expect(response.body.password).toEqual(undefined);
      });
    });

    describe('when passed, id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        const response = await authorizedGetUser(uuid());
        expect(response.status).toBe(404);
      });
    });
  });

  describe('PATCH /api/users/:id', () => {
    describe('a user can modify their info. They always need to send their password to modify it', () => {
      test('a user can modify their name', async () => {
        const updateResponse = await request
          .patch(`/api/users/${loggedInUser.id}`)
          .auth(auth.accessToken, { type: 'bearer' })
          .send({
            password: userFields.password,
            firstName: 'Nuevo firstName',
          });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.firstName).toBe('Nuevo firstName');
        expect(updateResponse.body.email).toBe(loggedInUser.email);
        const updatedUser = await app.context.orm.user.findByPk(loggedInUser.id);
        expect(updatedUser.firstName).toBe('Nuevo firstName');
        expect(updatedUser.email).toBe(loggedInUser.email);
        loggedInUser = updatedUser;
      });
      test('a user can modify their password sending newPassword attribute', async () => {
        const newPassword = 'totallynewpassword';
        const updateResponse = await request
          .patch(`/api/users/${loggedInUser.id}`)
          .auth(auth.accessToken, { type: 'bearer' })
          .send({
            password: userFields.password,
            newPassword,
          });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.firstName).toBe(loggedInUser.firstName);
        expect(updateResponse.body.email).toBe(loggedInUser.email);
        const updatedUser = await app.context.orm.user.findByPk(loggedInUser.id);
        const isPasswordOk = await updatedUser.checkPassword(newPassword);
        expect(isPasswordOk).toBe(true);
        expect(updatedUser.email).toBe(loggedInUser.email);
        loggedInUser = updatedUser;
        userFields = {
          ...userFields,
          password: newPassword,
        };
      });
      test('a user firstName cannot be empty', async () => {
        const updateResponse = await request
          .patch(`/api/users/${loggedInUser.id}`)
          .auth(auth.accessToken, { type: 'bearer' })
          .send({
            password: userFields.password,
            firstName: '',
          });
        expect(updateResponse.status).toBe(400);
        expect(updateResponse.body.errors.length).toBe(1);
        expect(updateResponse.body.errors[0].message).toBe('Validation notEmpty on firstName failed');
      });
    });

    describe('a user cannot modify another user', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/users/${loggedOutUser.id}`)
          .auth(auth.accessToken, { type: 'bearer' })
          .send({
            password: loggedOutUser.password,
            firstName: 'Nuevo firstName',
          });
      });
      test('responds with 403 status code', async () => {
        expect(updateResponse.status).toBe(403);
      });
      test('responds with a json body type', async () => {
        expect(updateResponse.type).toEqual('application/json');
      });
      test('message describing the error must match', async () => {
        expect(updateResponse.body.errors[0].message).toEqual(
          `You are not allowed to modify user with id ${loggedOutUser.id}`,
        );
      });
      test('responds body has correct user email', async () => {
        expect(updateResponse.body.errors[0].type).toEqual('Forbidden');
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('users cannot modify their profile if their are logged-out', async () => {
        const updateResponse = await request
          .patch(`/api/users/${loggedInUser.id}`)
          .send({
            password: userFields.password,
            firstName: 'Steve',
          });
        expect(updateResponse.status).toBe(401);
      });
    });
  });
});
