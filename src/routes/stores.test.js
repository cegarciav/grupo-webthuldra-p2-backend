const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Stores routes', () => {
  let auth;
  let loggedInUser;
  let loggedOutUser;
  let store;
  const userFields = {
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
  const storeFields = {
    id: uuid(),
    address: 'Test Address',
    name: 'Test Store',
    description: 'This is a test',
    ownerId: userFields.id,

  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    loggedInUser = await app.context.orm.user.create(userFields);
    loggedOutUser = await app.context.orm.user.create(user2Fields);
    store = await app.context.orm.store.create(storeFields);
    const authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: userFields.email, password: userFields.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /api/stores', () => {
    const authorizedGetStore = () => request
      .get('/api/stores')
      .auth(auth.accessToken, { type: 'bearer' });
    const unauthorizedGetStore = () => request.get('/api/stores');

    describe('when a user is logged-in, a list of stores is retrieved', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetStore(loggedInUser.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
    });

    describe('when a user is not logged-in, a 401 error is sent by the server', () => {
      test('unauthorized get request to endpoint', async () => {
        const response = await unauthorizedGetStore(loggedOutUser.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('GET /api/stores/:id', () => {
    const authorizedGetStore = (id) => request
      .get(`/api/stores/${id}`)
      .auth(auth.accessToken, { type: 'bearer' });
    const unauthorizedGetStore = (id) => request.get(`/api/stores/${id}`);

    describe('when passed, id corresponds to an existing store', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetStore(store.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('responds body has correct user id', async () => {
        expect(response.body.data.id).toEqual(store.id);
      });
      test('responds body has correct store name', async () => {
        expect(response.body.data.attributes.name).toEqual(store.name);
      });
      test('responds body has correct onwerId', async () => {
        expect(response.body.data.attributes.ownerId).toEqual(store.ownerId);
      });
    });

    describe('when passed, id does not correspond to any store', () => {
      test('responds with 404 status code', async () => {
        const response = await authorizedGetStore(uuid());
        expect(response.status).toBe(404);
      });
    });

    describe('when request is unauthorized because user is not logged in', () => {
      test('unauthorized get request to endpoint', async () => {
        const response = await unauthorizedGetStore(store.id);
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /api/stores/:id', () => {
    describe('when request is unauthorized because user is not logged in', () => {
      test('users cannot modify their store if their are logged-out', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${store.id}`)
          .send({
            firstName: 'New Store Name 3',
          });
        expect(updateResponse.status).toBe(401);
      });
    });
  });
});
