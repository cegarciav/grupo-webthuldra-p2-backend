const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Comments routes', () => {
  let authCustomer;
  const customerFields = {
    id: uuid(),
    firstName: 'Soila',
    lastName: 'Cliente',
    email: 'test@user.cl',
    password: 'testPassword',
  };
  const ownerFields = {
    id: uuid(),
    firstName: 'Soila',
    lastName: 'Propietaria',
    email: 'test2@user.cl',
    password: 'testPassword',
  };
  const storeFields = {
    id: uuid(),
    address: 'Fake Street 123',
    name: 'Tienda 1',
    description: 'Una tienda que vende productos',
    ownerId: ownerFields.id,
  };
  const productsFields = [
    {
      id: uuid(),
      name: 'Producto 1',
      stock: 100,
      price: 1000,
      unit: 'kg',
      storeId: storeFields.id,
    },
    {
      id: uuid(),
      name: 'Producto 2',
      stock: 50,
      price: 5000,
      storeId: storeFields.id,
    },
  ];
  const commentFields = {
    id: uuid(),
    text: 'new comment just for the GET test',
    grade: 5,
    reviewerId: customerFields.id,
    storeId: storeFields.id,
  };
  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(customerFields);
    await app.context.orm.user.create(ownerFields);
    const authCustomerResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: customerFields.email, password: customerFields.password });
    authCustomer = authCustomerResponse.body;
    await app.context.orm.store.create(storeFields);
    await app.context.orm.product.bulkCreate(productsFields);
    await app.context.orm.comment.create(commentFields);
  });
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  describe('POST api/stores/:storeId/comments', () => {
    let createResponse;
    const commentsFields = {
      text: 'comment',
      grade: 5,
    };
    beforeAll(async () => {
      createResponse = await request
        .post(`/api/stores/${storeFields.id}/comments`)
        .set('Content-type', 'application/json')
        .send(commentsFields)
        .auth(authCustomer.accessToken, { type: 'bearer' });
    });
    test('response with 201 status code', async () => {
      expect(createResponse.status).toBe(201);
    });
    test('response with a json body type', async () => {
      expect(createResponse.type).toEqual('application/json');
    });
    test('response body has correct text', async () => {
      expect(createResponse.body.text).toEqual(commentsFields.text);
    });
    test('response body has correct grade', async () => {
      expect(createResponse.body.grade).toEqual(commentsFields.grade);
    });
  });

  describe('GET api/stores/:storeId/comments', () => {
    let response;
    let theComment;
    beforeAll(async () => {
      response = await request
        .get(`/api/stores/${storeFields.id}/comments`)
        .auth(authCustomer.accessToken, { type: 'bearer' });
      theComment = response.body.filter((m) => m.id === commentFields.id);
    });
    test('response with 200 status code', async () => {
      expect(response.status).toBe(200);
    });
    test('response with a json body type', async () => {
      expect(response.type).toEqual('application/json');
    });
    test('response body contains at least one message', async () => {
      expect(response.body.length).toBeGreaterThan(0);
    });
    test('response body contains at least the message created directly to the db', async () => {
      expect(theComment[0].text).toEqual(commentFields.text);
    });
  });
});
