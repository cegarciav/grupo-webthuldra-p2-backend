const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Deals routes', () => {
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
  const store2Fields = {
    id: uuid(),
    address: 'Fake Street 124',
    name: 'Tienda 2',
    description: 'Otra tienda que vende productos',
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
  const product2ndStore = {
    id: uuid(),
    name: 'Producto 3',
    stock: 100,
    price: 10000,
    unit: 'kg',
    storeId: store2Fields.id,
  };
  const dealFields = {
    products: [
      {
        id: productsFields[1].id,
        amount: 10,
      },
    ],
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
    await app.context.orm.store.create(store2Fields);
    await app.context.orm.product.create(product2ndStore);
    await app.context.orm.product.bulkCreate(productsFields);
  });
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  describe('POST api/deals/:deal_id/mesagges', () => {
    let createResponse;
    beforeAll(async () => {
      const createdDeal = await request
        .post(`/api/stores/${storeFields.id}/deals`)
        .set('Content-type', 'application/json')
        .send(dealFields)
        .auth(authCustomer.accessToken, { type: 'bearer' });
      const messagesFields = {
        text: 'message',
      };
      createResponse = await request
        .post(`/api/deals/${createdDeal.id}/messages`)
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
  });
});
