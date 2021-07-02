const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Messages routes', () => {
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
  const dealFields = {
    id: uuid(),
    status: 'abierto',
    customerId: customerFields.id,
    storeId: storeFields.id,
  };
  const purchaseFields = {
    dealId: dealFields.id,
    productId: productsFields[0].id,
    amount: 10,
  };
  const messageFields = {
    id: uuid(),
    dealId: dealFields.id,
    sender: 'store',
    senderId: storeFields.id,
    text: 'new message just for the GET test',
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
    await app.context.orm.deal.create(dealFields);
    await app.context.orm.purchase.create(purchaseFields);
    await app.context.orm.message.create(messageFields);
  });
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  describe('POST api/deals/:deal_id/messages', () => {
    let createResponse;
    const messagesFields = {
      text: 'message',
    };
    beforeAll(async () => {
      createResponse = await request
        .post(`/api/deals/${dealFields.id}/messages`)
        .set('Content-type', 'application/json')
        .send(messagesFields)
        .auth(authCustomer.accessToken, { type: 'bearer' });
    });
    test('response with 201 status code', async () => {
      expect(createResponse.status).toBe(201);
    });
    test('response with a json body type', async () => {
      expect(createResponse.type).toEqual('application/json');
    });
    test('response body contains sender type customer', async () => {
      expect(createResponse.body.sender).toEqual('customer');
    });
    test('response body contains correct text', async () => {
      expect(createResponse.body.text).toEqual(messagesFields.text);
    });
    test('response body contains correct senderId', async () => {
      expect(createResponse.body.senderId).toEqual(customerFields.id);
    });
  });

  describe('GET api/deals/:deal_id/messages', () => {
    let response;
    let theMessage;
    beforeAll(async () => {
      response = await request
        .get(`/api/deals/${dealFields.id}/messages`)
        .auth(authCustomer.accessToken, { type: 'bearer' });
      theMessage = response.body.filter((m) => m.id === messageFields.id);
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
      expect(theMessage[0].text).toEqual(messageFields.text);
    });
  });
});
