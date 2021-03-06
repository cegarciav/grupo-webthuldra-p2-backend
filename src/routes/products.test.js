const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Products routes', () => {
  let authOwner;
  let store;
  let product;
  let authUser2;
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
  const user2Fields = {
    id: '0fde40ee-34f1-48f2-8831-d2ccdc0bafd6',
    firstName: 'Test2',
    lastName: 'User2',
    email: 'test3@user.cl',
    password: 'testPassword1',
  };
  const notUser2Fields = {
    id: '24520978-736d-4090-af65-bb9e28d85204',
    firstName: 'Test2',
    lastName: 'User2',
    email: 'test4@user.cl',
    password: 'testPassword2',
  };
  const storeFields = {
    id: '988006ed-f661-485d-bf3d-5cca0b11c1a1',
    address: 'Test Address',
    name: 'Test Store',
    description: 'This is a test',
    ownerId: ownerFields.id,
  };
  const store2Fields = {
    id: '988006ed-f661-485d-bf3d-5cca0b11c1a2',
    address: 'Test Address 2',
    name: 'Test Store 2',
    description: 'This is a test',
    ownerId: notOwnerFields.id,
  };
  const productFields = {
    id: '808796af-59b1-4e75-a70e-c1001ed97a0e',
    name: 'Product name',
    stock: 100,
    price: 1990,
    storeId: storeFields.id,
  };
  const product2Fields = {
    id: '808796af-59b1-4e75-a70e-c1001ed97a02',
    name: 'Product name',
    stock: 100,
    price: 1990,
    storeId: store2Fields.id,
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(ownerFields);
    await app.context.orm.user.create(notOwnerFields);
    store = await app.context.orm.store.create(storeFields);
    await app.context.orm.store.create(store2Fields);
    product = await app.context.orm.product.create(productFields);
    await app.context.orm.product.create(product2Fields);
    let authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: ownerFields.email, password: ownerFields.password });
    authOwner = authResponse.body;
    authResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: notOwnerFields.email, password: notOwnerFields.password });
    await app.context.orm.user.create(user2Fields);
    await app.context.orm.user.create(notUser2Fields);
    let user2Response = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: user2Fields.email, password: user2Fields.password });
    authUser2 = user2Response.body;
    user2Response = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: notUser2Fields.email, password: notUser2Fields.password });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET api/stores/:store_id/products', () => {
    const authorizedGetProduct = (storeId) => request
      .get(`/api/stores/${storeId}/products`)
      .auth(authOwner.accessToken, { type: 'bearer' });

    describe('when a user is logged-in, a list of products is retrieved', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetProduct(storeFields.id);
      });
      test('response with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('response with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('response contains at least the test product', async () => {
        const filteredData = response.body.filter((s) => s.id === productFields.id);
        expect(filteredData.length).toEqual(1);
      });
      test('response contains only the products for the given store', async () => {
        const filteredData = response.body.filter((s) => s.storeId !== storeFields.id);
        expect(filteredData.length).toEqual(0);
      });
    });
  });

  describe('GET /api/stores/store_id/products/:id', () => {
    const authorizedGetProduct = (storeId, productId) => request
      .get(`/api/stores/${storeId}/products/${productId}`)
      .auth(authOwner.accessToken, { type: 'bearer' });

    describe('when passed, id corresponds to an existing product', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetProduct(store.id, product.id);
      });
      test('responds with 200 status code', async () => {
        expect(response.status).toBe(200);
      });
      test('responds with a json body type', async () => {
        expect(response.type).toEqual('application/json');
      });
      test('response body has correct product id', async () => {
        expect(response.body.id).toEqual(product.id);
      });
      test('response body has correct product name', async () => {
        expect(response.body.name).toEqual(product.name);
      });
      test('response body has correct product stock', async () => {
        expect(response.body.stock).toEqual(product.stock);
      });
      test('response body has correct product price', async () => {
        expect(response.body.price).toEqual(product.price);
      });
      test('response body has correct storeId', async () => {
        expect(response.body.storeId).toEqual(product.storeId);
      });
    });

    describe('when passed, id does not correspond to any product', () => {
      let response;
      beforeAll(async () => {
        response = await authorizedGetProduct(store.id, '4c74458e-f05a-4729-8f36-7836552eef32');
      });
      test('responds with 404 status code', async () => {
        expect(response.status).toBe(404);
      });
      test('response should match snapshot', async () => {
        expect(response.body).toMatchSnapshot();
      });
    });
  });

  describe('POST api/stores/:store_id/products', () => {
    describe('users can create products associated to their stores', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store.id}/products`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Product 2',
            stock: 300,
            price: 5990,
            unit: 'kg',
          });
      });
      test('responds with 201 status code', async () => {
        expect(createResponse.status).toBe(201);
      });
      test('response body should contain the name set', async () => {
        expect(createResponse.body.name).toBe('Product 2');
      });
      test('response body should contain the stock set', async () => {
        expect(createResponse.body.stock).toBe(300);
      });
      test('response body should contain the price set', async () => {
        expect(createResponse.body.price).toBe(5990);
      });
      test('response body should contain the unit set', async () => {
        expect(createResponse.body.unit).toBe('kg');
      });
      test('response body should contain the storeId set automatically', async () => {
        expect(createResponse.body.storeId).toBe(store.id);
      });
    });

    describe('product stock should be greater than 0', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store.id}/products`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Product 2',
            stock: -2,
            price: 5990,
            unit: 'kg',
          });
      });
      test('responds with 400 status code', async () => {
        expect(createResponse.status).toBe(400);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('product price should be greater than 0', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store.id}/products`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Product 2',
            stock: 300,
            price: -100,
          });
      });
      test('responds with 400 status code', async () => {
        expect(createResponse.status).toBe(400);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('product price should be a number', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store.id}/products`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Product 2',
            stock: 'Some price',
            price: -100,
          });
      });
      test('responds with 400 status code', async () => {
        expect(createResponse.status).toBe(400);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('users cannot create products if their are logged-out', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store.id}/products`)
          .send({
            name: 'Product 2',
            stock: 'Some price',
            price: -100,
          });
      });
      test('responds with 401 status code', async () => {
        expect(createResponse.status).toBe(401);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });

    describe('users cannot create products in stores they do not own', () => {
      let createResponse;
      beforeAll(async () => {
        createResponse = await request
          .post(`/api/stores/${store2Fields.id}/products`)
          .auth(authOwner.accessToken, { type: 'bearer' })
          .send({
            name: 'Product 2',
            stock: 500,
            price: 100,
          });
      });
      test('responds with 403 status code', async () => {
        expect(createResponse.status).toBe(403);
      });
      test('response should match snapshot', async () => {
        expect(createResponse.body).toMatchSnapshot();
      });
    });
  });
  describe('PATCH /stores/:storeId/products/:id', () => {
    let createdProduct;
    const productData = {
      name: 'producto1',
      stock: 10,
      price: 500,
      unit: 'unit',
    };
    beforeAll(async () => {
      createdProduct = await request
        .post(`/api/stores/${store.id}/products`)
        .set('Content-type', 'application/json')
        .send(productData)
        .auth(authOwner.accessToken, { type: 'bearer' });
    });
    describe('store owner can modify a product in their store', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/products/${createdProduct.body.id}`)
          .set('Content-type', 'application/json')
          .send({ name: 'producto testeado' })
          .auth(authOwner.accessToken, { type: 'bearer' });
      });
      test('response with 200 status code', async () => {
        expect(updateResponse.status).toBe(200);
      });
    });
    describe('a user cannot modify a product of a store they do not own', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/products/${createdProduct.body.id}`)
          .set('Content-type', 'application/json')
          .send({ name: 'producto testeado 2' })
          .auth(authUser2.accessToken, { type: 'bearer' });
      });
      test('response with 403 status code', async () => {
        expect(updateResponse.status).toBe(403);
      });
      test('response with a json body type', async () => {
        expect(updateResponse.type).toEqual('application/json');
      });
    });
    describe('request is unauthorized because user is not logged in', () => {
      test('users cannot modify products if their are logged-out', async () => {
        const updateResponse = await request
          .patch(`/api/stores/${storeFields.id}/products/${createdProduct.body.id}`)
          .set('Content-type', 'application/json')
          .send({ name: 'producto testeado 2' });
        expect(updateResponse.status).toBe(401);
      });
    });
  });
  describe('DELETE /stores/:storeId/products/:id', () => {
    let createdProduct;
    const productData = {
      name: 'producto1',
      stock: 10,
      price: 500,
      unit: 'unit',
    };
    beforeAll(async () => {
      createdProduct = await request
        .post(`/api/stores/${store.id}/products`)
        .set('Content-type', 'application/json')
        .send(productData)
        .auth(authOwner.accessToken, { type: 'bearer' });
    });
    describe('store owner can delete a product in their store', () => {
      let updateResponse;
      beforeAll(async () => {
        updateResponse = await request
          .delete(`/api/stores/${storeFields.id}/products/${createdProduct.body.id}`)
          .send(createdProduct.destroy())
          .auth(authOwner.accessToken, { type: 'bearer' });
      });
      test('response with 204 status code', async () => {
        expect(updateResponse.status).toBe(204);
      });
    });
  });
});
