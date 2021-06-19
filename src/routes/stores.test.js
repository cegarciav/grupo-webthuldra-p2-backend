const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Stores routes', () => {
  let authOwner;
  let authNotOwner;
  let ownerLoggedInUser;
  let store;
  const ownerFields = {
    id: '0fde40ee-34f1-48f2-8831-d2ccdc0bafd5',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@user.cl',
    password: 'testPassword',
  };
  const notOwnerFields = {
    id: '24520978-736d-4090-af65-bb9e28d85203',
    firstName: 'Test',
    lastName: 'User',
    email: 'test2@user.cl',
    password: 'testPassword',
  };
  const storeFields = {
    id: '988006ed-f661-485d-bf3d-5cca0b11c1a1',
    address: 'Test Address',
    name: 'Test Store',
    description: 'This is a test',
    ownerId: ownerFields.id,

  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    ownerLoggedInUser = await app.context.orm.user.create(ownerFields);
    await app.context.orm.user.create(notOwnerFields);
    store = await app.context.orm.store.create(storeFields);
    let authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: ownerFields.email, password: ownerFields.password });
    authOwner = authResponse.body;
    authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: notOwnerFields.email, password: notOwnerFields.password });
    authNotOwner = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /api/stores', () => {
    const authorizedGetStore = () => request
      .get('/api/stores')
      .auth(authOwner.accessToken, { type: 'bearer' });

    describe('when a user is logged-in, a list of stores is retrieved', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetStore(ownerLoggedInUser.id);
      });
      test('response with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('response with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('response contains at least the test store', async () => {
        const filteredData = response.body.filter((s) => s.id === storeFields.id);
        expect(filteredData.length).toEqual(1);
      });
    });

    describe('a logged-in user can use filters to retrieve stores', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .get(`/api/stores?address=${storeFields.address}`)
          .auth(authOwner.accessToken, { type: 'bearer' });
      });
      test('response with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('response with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('the list of stores should be equal to 1', async () => {
        expect(response.body.length).toEqual(1);
      });
      test(`the address of the store retrieved should be ${storeFields.address}`, async () => {
        expect(response.body[0].address).toEqual(storeFields.address);
      });
    });

    describe('when a user is not logged-in, a 401 error is sent by the server', () => {
      let response;
      beforeAll(async () => {
        response = await request
          .get(`/api/stores?address=${storeFields.address}`);
      });
      test('unauthorized get request to endpoint', async () => {
        expect(response.status).toBe(401);
      });
      test('response should match snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });

  describe('GET /api/stores/:id', () => {
    const authorizedGetStore = (id) => request
      .get(`/api/stores/${id}`)
      .auth(authOwner.accessToken, { type: 'bearer' });
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
      test('response body has correct user id', async () => {
        expect(response.body.id).toEqual(store.id);
      });
      test('response body has correct store name', async () => {
        expect(response.body.name).toEqual(store.name);
      });
      test('response body has correct store address', async () => {
        expect(response.body.address).toEqual(store.address);
      });
      test('response body has correct onwerId', async () => {
        expect(response.body.ownerId).toEqual(store.ownerId);
      });
    });

    describe('when passed, id does not correspond to any store', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetStore('f8a40537-85da-41f6-a5cc-6bf691965333');
      });
      test('responds with 404 status code', async () => {
        expect(response.status).toBe(404);
      });
      test('response should match snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
    });

    describe('when request is unauthorized because user is not logged-in', () => {
      let response;
      beforeAll(async () => {
        response = await unauthorizedGetStore(store.id);
      });
      test('responds with 401 status code', async () => {
        expect(response.status).toBe(401);
      });
      test('response should match snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });

  describe('POST /api/stores', () => {
    describe('users can create stores associated to them', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post('/api/stores')
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Second store for the same owner',
            address: 'Fake Street 123',
          });
      });
      test('responds with 201 status code', async () => {
        expect(createResponse.status).toBe(201);
      });
      test('response body should contain the name set', async () => {
        expect(createResponse.body.name).toBe('Second store for the same owner');
      });
      test('response body should contain the address set', async () => {
        expect(createResponse.body.address).toBe('Fake Street 123');
      });
      test('response body should contain the onwerId set automatically', async () => {
        expect(createResponse.body.ownerId).toBe(ownerFields.id);
      });
    });

    describe('store address should be unique', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post('/api/stores')
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Third store for the same owner',
            address: storeFields.address,
          });
      });
      test('responds with 400 status code', async () => {
        expect(createResponse.status).toBe(400);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('store name should be unique', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post('/api/stores')
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: storeFields.name,
            address: 'Random address you will never find',
          });
      });
      test('responds with 400 status code', async () => {
        expect(createResponse.status).toBe(400);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('users cannot create stores if their are logged-out', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post('/api/stores')
          .send({
            name: 'Name',
            address: 'Address',
          });
      });
      test('responds with 401 status code', async () => {
        expect(createResponse.status).toBe(401);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });
  });

  describe('PATCH /api/stores/:id', () => {
    describe('users cannot modify their store if their are logged-out', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${store.id}`)
          .send({
            name: 'New Store Name 3',
          });
      });
      test('responds with 401 status code', async () => {
        expect(updateResponse.status).toBe(401);
      });
      test('response should match snapshot', async () => {
        expect(updateResponse.body).toMatchSnapshot();
      });
    });

    describe('users cannot modify a store they do not own', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${store.id}`)
          .auth(authNotOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'New Store Name 3',
          });
      });
      test('responds with 403 status code', async () => {
        expect(updateResponse.status).toBe(403);
      });
      test('response should match snapshot', async () => {
        expect(updateResponse.body).toMatchSnapshot();
      });
    });

    describe('users can modify stores they own', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${store.id}`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'New Store Name 3',
            description: 'Some new description for this store',
          });
      });
      test('responds with 200 status code', async () => {
        expect(updateResponse.status).toBe(200);
      });
      test('response body should have the updated name', async () => {
        expect(updateResponse.body.name).toBe('New Store Name 3');
      });
      test('response body should have the updated description', async () => {
        expect(updateResponse.body.description).toBe('Some new description for this store');
      });
    });
  });
});
