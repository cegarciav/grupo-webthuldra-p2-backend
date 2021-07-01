const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Deals routes', () => {
  let authCustomer;
  let authOwner;
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

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(customerFields);
    await app.context.orm.user.create(ownerFields);
    const authCustomerResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: customerFields.email, password: customerFields.password });
    authCustomer = authCustomerResponse.body;
    const authOwnerResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: ownerFields.email, password: ownerFields.password });
    authOwner = authOwnerResponse.body;

    await app.context.orm.store.create(storeFields);
    await app.context.orm.store.create(store2Fields);
    await app.context.orm.product.create(product2ndStore);
    await app.context.orm.product.bulkCreate(productsFields);
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('POST /stores/:storeId/deals', () => {
    describe('Successful creation of a deal', () => {
      let createResponse;
      const dealData = {
        products: [
          {
            id: productsFields[0].id,
            amount: 5,
          },
          {
            id: productsFields[1].id,
            amount: 10,
          },
        ],
      };

      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
      });
      test('response with 201 status code', async () => {
        expect(createResponse.status).toBe(201);
      });
      test('response with a json body type', async () => {
        expect(createResponse.type).toEqual('application/json');
      });
      test('response body has correct deal status', async () => {
        expect(createResponse.body.status).toEqual('abierto');
      });
      test('response body has correct customerId', async () => {
        expect(createResponse.body.customerId).toEqual(customerFields.id);
      });
      test('response body contains customer information', async () => {
        expect(createResponse.body.customer.id).toEqual(customerFields.id);
        expect(createResponse.body.customer.email).toEqual(customerFields.email);
      });
      test('response body contains products information', async () => {
        expect(createResponse.body.products.length).toEqual(2);
        expect(createResponse.body.products.map((p) => p.name))
          .toEqual(expect.arrayContaining(productsFields.map((p) => p.name)));
      });
      test('response body contains purchases information', async () => {
        expect(createResponse.body.products.map((p) => ({
          amount: p.purchase.amount,
          productId: p.purchase.productId,
        })))
          .toEqual(expect.arrayContaining(
            dealData.products.map((p) => expect.objectContaining({
              amount: p.amount,
              productId: p.id,
            })),
          ));
      });
      test('resource is available in the database', async () => {
        const newDeal = await app.context.orm.deal.findByPk(
          createResponse.body.id,
        );
        expect(createResponse.body.id).toEqual(newDeal.id);
      });
    });

    describe('Failing creation of deal', () => {
      test('attribute products is not sent', async () => {
        const dealData = { };
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
      });
      test('attribute products is not properly formed: amount equal to 0', async () => {
        const dealData = {
          products: [
            {
              id: productsFields[0].id,
              amount: 0,
            },
          ],
        };
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
      });
      test('attribute products is not properly formed: repeated product with negative total amount', async () => {
        const dealData = {
          products: [
            {
              id: productsFields[0].id,
              amount: 10,
            },
            {
              id: productsFields[0].id,
              amount: -15,
            },
          ],
        };
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
      });
      test('attribute products is not properly formed: product does not exist', async () => {
        const dealData = {
          products: [
            {
              id: uuid(),
              amount: 10,
            },
          ],
        };
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
      });
      test('attribute products is not properly formed: products from different stores', async () => {
        const dealData = {
          products: [
            {
              id: productsFields[0].id,
              amount: 10,
            },
            {
              id: product2ndStore.id,
              amount: 10,
            },
          ],
        };
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send(dealData)
          .auth(authCustomer.accessToken, { type: 'bearer' });
        expect(createResponse.status).toBe(400);
        expect(createResponse.body.errors.length).toBe(1);
      });
      test('unauthorized request to endpoint', async () => {
        const createResponse = await request
          .post(`/api/stores/${storeFields.id}/deals`)
          .set('Content-type', 'application/json')
          .send({});
        expect(createResponse.status).toBe(401);
      });
    });
  });

  describe('GET /api/users/me/deals', () => {
    const authorizedGetUser = () => request
      .get('/api/users/me/deals')
      .auth(authCustomer.accessToken, { type: 'bearer' });
    const unauthorizedGetUser = () => request.get('/api/users/me/deals');
    let createResponse;
    const dealData = {
      products: [
        {
          id: productsFields[0].id,
          amount: 5,
        },
      ],
    };

    beforeAll(async () => {
      await app.context.orm.deal.destroy({ where: { customerId: customerFields.id } });
      createResponse = await request
        .post(`/api/stores/${storeFields.id}/deals`)
        .set('Content-type', 'application/json')
        .send(dealData)
        .auth(authCustomer.accessToken, { type: 'bearer' });
    });

    describe('only a logged-in user can retrive its information', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetUser(authCustomer.id);
      });
      test('response with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('response with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('response body contains the deal created', async () => {
        expect(response.body.length).toEqual(1);
        expect(response.body[0].id).toEqual(createResponse.body.id);
      });
    });

    describe('request is unauthorized when user is not logged in', () => {
      test('unauthorized get request to endpoint', async () => {
        const response = await unauthorizedGetUser();
        expect(response.status).toBe(401);
      });
    });
  });

  describe('PATCH /stores/:storeId/deals/:id', () => {
    let createdDeal;
    const dealData = {
      products: [
        {
          id: productsFields[1].id,
          amount: 10,
        },
      ],
    };
    beforeAll(async () => {
      createdDeal = await request
        .post(`/api/stores/${storeFields.id}/deals`)
        .set('Content-type', 'application/json')
        .send(dealData)
        .auth(authCustomer.accessToken, { type: 'bearer' });
    });

    describe('store owner can modify a deal in their store', () => {
      test('store owner can change the status of a deal to "completado"', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({ status: 'completado' })
          .auth(authOwner.accessToken, { type: 'bearer' });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe('completado');
        expect(updateResponse.body.id).toBe(createdDeal.body.id);
        const updatedDeal = await app.context.orm.deal.findByPk(createdDeal.body.id);
        expect(updatedDeal.status).toBe('completado');
      });
      test('store owner can change the status of a deal to "rechazado"', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({ status: 'rechazado' })
          .auth(authOwner.accessToken, { type: 'bearer' });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe('rechazado');
        expect(updateResponse.body.id).toBe(createdDeal.body.id);
        const updatedDeal = await app.context.orm.deal.findByPk(createdDeal.body.id);
        expect(updatedDeal.status).toBe('rechazado');
      });
      test('deal status must be one of: [abierto, rechazado, completado]', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({ status: 'anotherStatus' })
          .auth(authOwner.accessToken, { type: 'bearer' });
        expect(updateResponse.status).toBe(400);
        expect(updateResponse.body.errors.length).toBe(1);
        expect(updateResponse.body.errors[0].message).toBe('Validation isIn on status failed');
      });
      test('status must be sent', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({})
          .auth(authOwner.accessToken, { type: 'bearer' });
        expect(updateResponse.status).toBe(400);
        expect(updateResponse.body.errors.length).toBe(1);
        expect(updateResponse.body.errors[0].message).toBe('Attribute status is mandatory');
      });
    });

    describe('a user cannot modify a deal of a store they do not own', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({ status: 'completado' })
          .auth(authCustomer.accessToken, { type: 'bearer' });
      });
      test('response with 403 status code', async () => {
        expect(updateResponse.status).toBe(403);
      });
      test('response with a json body type', async () => {
        expect(updateResponse.type).toEqual('application/json');
      });
      test('message describing the error must match', async () => {
        expect(updateResponse.body.errors[0].message).toEqual(
          `You are not allowed to modify deal with id ${createdDeal.body.id}`,
        );
      });
      test('response body has correct message type Forbodden', async () => {
        expect(updateResponse.body.errors[0].type).toEqual('Forbidden');
      });
    });

    describe('request is unauthorized because user is not logged in', () => {
      test('users cannot modify deals if their are logged-out', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .set('Content-type', 'application/json')
          .send({ status: 'completado' });
        expect(updateResponse.status).toBe(401);
      });
    });
  });
  describe('GET /api/stores/store_id/deals/:id', () => {
    let createdDeal;
    const dealData = {
      products: [
        {
          id: productsFields[1].id,
          amount: 10,
        },
      ],
    };
    beforeAll(async () => {
      createdDeal = await request
        .post(`/api/stores/${storeFields.id}/deals`)
        .set('Content-type', 'application/json')
        .send(dealData)
        .auth(authCustomer.accessToken, { type: 'bearer' });
    });
    describe('store owner can modify a deal in their store', () => {
      test('store owner can change the status of a deal to "completado"', async () => {
        const updateResponse = await request
          .get(`/api/stores/${storeFields.id}/deals/${createdDeal.body.id}`)
          .auth(authOwner.accessToken, { type: 'bearer' });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.type).toEqual('application/json');
      });
    });
  });
});
