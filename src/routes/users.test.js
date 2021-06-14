const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Users routes', () => {
  let auth;
  beforeAll(async () => {
    const userFields = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@user.cl',
      password: 'testPassword',
    };
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(userFields);
    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /api/users/:id', () => {
    let user;
    let response;
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@user.cl',
      password: 'testPassword',
    };
    const authorizedGetUser = (id) => request
      .get(`/api/users/${id}`)
      .auth(auth.accessToken, { type: auth.token_type });
    const unauthorizedGetUser = (id) => request.get(`/api/users/${id}`);
    beforeAll(async () => {
      user = await app.context.orm.user.create(userData);
    });

    describe('when passed id corresponds to an existing user', () => {
      beforeAll(async () => {
        response = await authorizedGetUser(user.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('body matches snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('when passed id does not correspond to any user', () => {
      test('responds with 404 status code', async () => {
        response = await authorizedGetUser(user.id * -1);
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('unauthorized get request to endpoint', async () => {
        response = await unauthorizedGetUser(user.id);
        expect(response.status).toBe(401);
      });
    });
  });
});
