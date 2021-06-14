const KoaRouter = require('koa-router');
const { Serializer } = require('jsonapi-serializer');
const { uuid } = require('uuidv4');

const router = new KoaRouter();
const storeSerializer = new Serializer('stores', {
  attributes: ['address', 'name', 'description', 'ownerId'],
  keyForAttributes: 'camelCase',
});

router.post('stores.create', '/', async (ctx) => {
  try {
    const store = ctx.orm.store.build({
      ...ctx.request.body,
      id: uuid(),
    });
    await store.save({ field: ['id', 'address', 'name', 'description', 'ownerId'] });
    ctx.status = 201;
    ctx.body = storeSerializer.serialize(store);
  } catch (e) {
    if (['SequelizeAssociationError', 'SequelizeUniqueConstraintError'].includes(e.name)) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else {
      ctx.throw(500);
    }
  }
});

router.param('id', async (id, ctx, next) => {
  ctx.state.store = await ctx.orm.store.findByPk(id);
  if (!ctx.state.store) ctx.throw(404, `Store with id ${id} could not be found`);
  return next();
});

router.get('stores.list', '/', async (ctx) => {
  const stores = await ctx.orm.store.findAll();
  ctx.body = storeSerializer.serialize(stores);
});

router.get('stores.show', '/:id', async (ctx) => {
  ctx.body = storeSerializer.serialize(ctx.state.store);
});

router.patch('stores.update', '/:id', async (ctx) => {
  const { currentUser, store } = ctx.state;
  try {
    if (store.ownerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify user with id ${currentUser.id}`);
    } else {
      const modifications = {
        ...ctx.request.body,
      };
      await ctx.orm.store.update(modifications, {
        where: { id: store.id },
        individualHooks: true,
      });
      const updatedStore = await ctx.orm.store.findByPk(store.id);
      ctx.body = storeSerializer.serialize(updatedStore);
    }
  } catch (e) {
    if (['SequelizeAssociationError', 'SequelizeUniqueConstraintError'].includes(e.name)) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else if (e.status) {
      ctx.throw(e);
    } else {
      ctx.throw(505);
    }
  }
});

module.exports = router;
