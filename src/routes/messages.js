const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

router.post('messages.create', '/', async (ctx) => {
  const { currentUser } = ctx.state;
  const deal = await ctx.orm.deal.findByPk(ctx.params.dealId);
  const store = await ctx.orm.store.findByPk(deal.storeId);
  try {
    if (currentUser.id !== deal.customerId && currentUser.id !== store.ownerId) {
      ctx.throw(403, `You are not allowed to send messages about deal with id ${deal.id}`);
    } else if (currentUser.id === deal.customerId) {
      const message = ctx.orm.message.build({
        ...ctx.request.body,
        id: uuid(),
        dealId: deal.id,
        sender: 'customer',
        senderId: deal.customerId,
      });
      await message.save({ field: ['id', 'text', 'dealId', 'sender', 'senderId'] });
      ctx.status = 201;
      ctx.body = message;
    } else if (currentUser.id === store.ownerId) {
      const message = ctx.orm.message.build({
        ...ctx.request.body,
        id: uuid(),
        dealId: deal.id,
        sender: 'store',
        senderId: store.ownerId,
      });
      await message.save({ field: ['id', 'text', 'dealId', 'sender', 'senderId'] });
      ctx.status = 201;
      ctx.body = message;
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
  ctx.state.message = await ctx.orm.message.findByPk(id);
  if (!ctx.state.message) ctx.throw(404, `Message with id ${id} could not be found`);
  return next();
});

router.get('messages.list', '/', async (ctx) => {
  const messages = await ctx.orm.message.findAll({
    where: {
      dealId: ctx.params.dealId,
    },
  });
  ctx.body = messages;
});

module.exports = router;
