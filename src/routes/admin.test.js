const { uuid } = require('uuidv4');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app.callback());

describe('Admin routes', () => {
  let authCustomer;
  let authNoAdmin;
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
  const adminFields = {
    id: uuid(),
    userId: customerFields.id,
  };

  const commentFields = {
    id: uuid(),
    text: 'Muy buenos brownies',
    grade: 4,
    reviewerId: customerFields.id,
    storeId: storeFields.id,
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    await app.context.orm.user.create(customerFields);
    await app.context.orm.user.create(ownerFields);
    let authUserResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: customerFields.email, password: customerFields.password });
    authCustomer = authUserResponse.body;
    authUserResponse = await request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ email: ownerFields.email, password: ownerFields.password });
    authNoAdmin = authUserResponse.body;
    await app.context.orm.store.create(storeFields);
    await app.context.orm.store.create(store2Fields);
    await app.context.orm.product.bulkCreate(productsFields);
    await app.context.orm.deal.create(dealFields);
    await app.context.orm.purchase.create(purchaseFields);
    await app.context.orm.message.create(messageFields);
    await app.context.orm.comment.create(commentFields);
    await app.context.orm.administrator.create(adminFields);
  });
  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });
  describe('DELETE api/admin/comments/:commentId', () => {
    describe('DELETE comment denied to normal users', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/comments/${commentFields.id}`)
          .auth(authNoAdmin.accessToken, { type: 'bearer' });
      });
      test('response with 403 status code', async () => {
        expect(deleteResponse.status).toBe(403);
      });
    });
    describe('DELETE comment by administrator', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/comments/${commentFields.id}`)
          .auth(authCustomer.accessToken, { type: 'bearer' });
      });
      test('response with 204 status code', async () => {
        expect(deleteResponse.status).toBe(204);
      });
      test('comment not anymore in db', async () => {
        const availableComments = await app.context.orm.comment.findByPk(commentFields.id);
        expect(availableComments).toBe(null);
      });
    });
  });

  describe('DELETE api/admin/stores/:storeId', () => {
    describe('DELETE store denied to normal users', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/stores/${storeFields.id}`)
          .auth(authNoAdmin.accessToken, { type: 'bearer' });
      });
      test('response with 403 status code', async () => {
        expect(deleteResponse.status).toBe(403);
      });
    });
    describe('DELETE store by administrator', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/stores/${storeFields.id}`)
          .auth(authCustomer.accessToken, { type: 'bearer' });
      });
      test('response with 204 status code', async () => {
        expect(deleteResponse.status).toBe(204);
      });
      test('store not anymore in db', async () => {
        const availableStores = await app.context.orm.store.findByPk(storeFields.id);
        expect(availableStores).toBe(null);
      });
      test('associated products not anymore in db', async () => {
        const availableStores = await app.context.orm.product.findAll({
          where: { storeId: storeFields.id },
        });
        expect(availableStores.length).toEqual(0);
      });
    });
  });

  describe('DELETE api/admin/users/:userId', () => {
    describe('DELETE user denied to normal users', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/users/${ownerFields.id}`)
          .auth(authNoAdmin.accessToken, { type: 'bearer' });
      });
      test('response with 403 status code', async () => {
        expect(deleteResponse.status).toBe(403);
      });
    });
    describe('DELETE user by administrator', () => {
      let deleteResponse;
      beforeAll(async () => {
        deleteResponse = await request
          .delete(`/api/admin/users/${ownerFields.id}`)
          .auth(authCustomer.accessToken, { type: 'bearer' });
      });
      test('response with 204 status code', async () => {
        expect(deleteResponse.status).toBe(204);
      });
      test('user not anymore in db', async () => {
        const availableUsers = await app.context.orm.user.findByPk(ownerFields.id);
        expect(availableUsers).toBe(null);
      });
      test('associated stores not anymore in db', async () => {
        const availableStores = await app.context.orm.store.findAll({
          where: { ownerId: ownerFields.id },
        });
        expect(availableStores.length).toEqual(0);
      });
    });
  });
});
