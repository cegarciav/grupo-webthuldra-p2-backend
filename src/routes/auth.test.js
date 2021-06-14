require('dotenv').config();
const { uuid } = require('uuidv4');
const jwtGenerator = require('jsonwebtoken');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Auth routes', () => {
  let loggedInUser;
  const userFields = {
    id: uuid(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@user.cl',
    password: 'testPassword',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    loggedInUser = await app.context.orm.user.create(userFields);
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /api/users', () => {
    describe('Successful authentication', () => {
      let authResponse;
      let auth;
      beforeAll(async () => {
        authResponse = await request
          .post('/api/auth')
          .set('Content-type', 'application/json')
          .send({ email: userFields.email, password: userFields.password });
        auth = authResponse.body;
      });
      test('responds with 200 status code', async () => {
        expect(authResponse.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(authResponse.type).toEqual('application/json');
      });
      test('response body has an accessToken', async () => {
        expect(auth.accessToken).toBeTruthy();
      });
      test('responds a bearer token', async () => {
        expect(auth.tokenType).toEqual('Bearer');
      });
      test('jwt is valid token', async () => {
        const token = jwtGenerator.verify(auth.accessToken, process.env.JWT_SECRET);
        expect(token.sub).toEqual(loggedInUser.id);
      });
    });

    describe('Failing authentication', () => {
      test('email not found', async () => {
        const fakeEmail = 'someRandomemail@test.com';
        const authResponse = await request
          .post('/api/auth')
          .set('Content-type', 'application/json')
          .send({ email: fakeEmail, password: userFields.password });
        expect(authResponse.status).toBe(404);
        expect(authResponse.body.errors.length).toBe(1);
        expect(authResponse.body.errors[0].message).toBe(`No user found with email ${fakeEmail}`);
      });
      test('incorrect password', async () => {
        const fakePassword = 'someRandom_pasword';
        const authResponse = await request
          .post('/api/auth')
          .set('Content-type', 'application/json')
          .send({ email: userFields.email, password: fakePassword });
        expect(authResponse.status).toBe(401);
        expect(authResponse.body.errors.length).toBe(1);
        expect(authResponse.body.errors[0].message).toBe('The password you’ve entered is incorrect');
      });
    });
  });
});
