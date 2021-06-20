const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

async function getStore(ctx, next) {
  ctx.state.store = await ctx.orm.store.findByPk(ctx.params.storeId);
  if (!ctx.state.store) ctx.throw(404, `Store with id ${ctx.params.storeId} could not be found`);
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
      ctx.body = product;
    }
  } catch (e) {
    if (e.name && e.name.includes('Sequelize')) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else if (e.status) {
      ctx.throw(e);
    } else {
      ctx.throw(500);
    }
  }
});

router.param('id', async (id, ctx, next) => {
  ctx.state.product = await ctx.orm.product.findByPk(id, {
    include: {
      association: 'store',
      attributes: ['address', 'name', 'description'],
    },
  });
  if (!ctx.state.product) ctx.throw(404, `Product with id ${id} could not be found`);
  return next();
});

router.get('products.list', '/', getStore, async (ctx) => {
  const { store } = ctx.state;
  const products = await ctx.orm.product.findAll({
    where: {
      storeId: store.id,
    },
  });
  ctx.body = products;
});

router.get('products.show', '/:id', async (ctx) => {
  ctx.body = ctx.state.product;
});

module.exports = router;
