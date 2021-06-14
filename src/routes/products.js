const KoaRouter = require('koa-router');
const { Serializer } = require('jsonapi-serializer');
const { uuid } = require('uuidv4');

const router = new KoaRouter();
const productSerializer = new Serializer('products', {
  attributes: ['name', 'stock', 'price', 'unit', 'storeId'],
  keyForAttributes: 'camelCase',
});

async function getStore(ctx, next) {
  ctx.state.store = await ctx.orm.store.findByPk(ctx.params.storeId);
  if (!ctx.state.store) return ctx.throw(404);
  return next();
}

router.post('products.create', '/', getStore, async (ctx) => {
  const { currentUser, store } = ctx.state;
  try {
    if (store.ownerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to add products to this store with id ${currentUser.id}`);
    } else {
      const product = ctx.orm.product.build({
        ...ctx.request.body,
        id: uuid(),
        storeId: store.id,
      });
      await product.save({ field: ['id', 'name', 'stock', 'price', 'unit', 'storeId'] });
      ctx.status = 201;
      ctx.body = productSerializer.serialize(product);
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

router.param('id', async (id, ctx, next) => {
  ctx.state.product = await ctx.orm.product.findByPk(id);
  if (!ctx.state.product) ctx.throw(404, `Product with id ${id} could not be found`);
  return next();
});

router.get('products.list', '/', async (ctx) => {
  const products = await ctx.orm.product.findAll();
  ctx.body = productSerializer.serialize(products);
});

router.get('products.show', '/:id', async (ctx) => {
  ctx.body = productSerializer.serialize(ctx.state.product);
});

module.exports = router;
