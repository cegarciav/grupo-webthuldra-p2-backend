const KoaRouter = require('koa-router');
const { Serializer } = require('jsonapi-serializer');
const { uuid } = require('uuidv4');

const router = new KoaRouter();
const dealSerializer = new Serializer('deals', {
  attributes: ['status', 'customerId'],
  keyForAttribute: 'camelCase',
});

async function getStore(ctx, next) {
  ctx.state.store = await ctx.orm.store.findByPk(ctx.params.storeId);
  if (!ctx.state.store) return ctx.throw(404);
  return next();
}

router.post('deals.create', '/', getStore, async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const deal = ctx.orm.deal.build({
      id: uuid(),
      status: 'abierto',
      customerId: currentUser.id,
    });
    await deal.save({ field: ['id', 'status', 'customerId'] });
    ctx.request.body.products.forEach(async (element) => {
      const purchase = ctx.orm.purchase.build({
        productId: element.id,
        amount: element.amount,
        dealId: deal.id,
      });
      await purchase.save({ field: ['productId', 'amount', 'dealId'] });
    });
    ctx.status = 201;
    ctx.body = dealSerializer.serialize(deal);
  } catch (e) {
    if (['SequelizeAssociationError', 'SequelizeUniqueConstraintError'].includes(e.name)) {
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
  ctx.state.deal = await ctx.orm.deal.findByPk(id);
  if (!ctx.state.deal) ctx.throw(404, `Deal with id ${id} could not be found`);
  return next();
});

router.patch('deals.update', '/:id', getStore, async (ctx) => {
  const { currentUser, store, deal } = ctx.state;
  try {
    if (store.ownerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify deal with id ${currentUser.id}`);
    } else {
      const modifications = {
        ...ctx.request.body,
      };
      await ctx.orm.deal.update(modifications, {
        where: { id: deal.id },
        individualHooks: true,
      });
      const updatedDeal = await ctx.orm.deal.findByPk(deal.id);
      ctx.body = dealSerializer.serialize(updatedDeal);
    }
  } catch (e) {
    if (['SequelizeAssociationError', 'SequelizeUniqueConstraintError'].includes(e.name)) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else if (e.status) {
      ctx.throw(e);
    } else {
      ctx.throw(500);
    }
  }
});

module.exports = router;
