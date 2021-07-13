const KoaRouter = require('koa-router');
const { Op } = require('sequelize');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

router.post('stores.create', '/', async (ctx) => {
  try {
    const { currentUser } = ctx.state;
    const store = ctx.orm.store.build({
      ...ctx.request.body,
      ownerId: currentUser.id,
      id: uuid(),
      picture: ctx.request.body.picture || null,
    });
    await store.save({ field: ['id', 'address', 'name', 'description', 'ownerId', 'picture'] });
    ctx.status = 201;
    ctx.body = store;
  } catch (e) {
    if (e.name && e.name.includes('Sequelize')) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else {
      ctx.throw(500);
    }
  }
});

router.param('id', async (id, ctx, next) => {
  ctx.state.store = await ctx.orm.store.findByPk(id, {
    include: {
      association: 'owner',
      attributes: ['firstName', 'lastName', 'email'],
    },
  });
  if (!ctx.state.store) ctx.throw(404, `Store with id ${id} could not be found`);
  return next();
});

router.get('stores.list', '/', async (ctx) => {
  try {
    const filters = {};
    Object.keys(ctx.request.query)
      .filter((param) => ['address', 'name', 'description'].includes(param) && ctx.request.query[param])
      .forEach((param) => { filters[param] = { [Op.iLike]: `%${ctx.request.query[param]}%` }; });
    if (ctx.request.query.ownerId) filters.ownerId = ctx.request.query.ownerId;

    const stores = await ctx.orm.store.findAll({ where: filters });
    ctx.body = stores;
  } catch (e) {
    if (e.name === 'SequelizeDatabaseError') {
      ctx.state.errors = [{
        message: 'ownerId must be a string with uuid format',
        type: 'Wrong format',
      }];
      ctx.throw(400);
    } else if (e.name && e.name.includes('Sequelize')) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else {
      ctx.throw(500);
    }
  }
});

router.get('stores.show', '/:id', async (ctx) => {
  ctx.body = ctx.state.store;
});

router.patch('stores.update', '/:id', async (ctx) => {
  const { currentUser, store } = ctx.state;
  try {
    if (store.ownerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify store with id ${store.id}`);
    } else {
      const modifications = {
        picture: ctx.request.body.picture || null,
        description: ctx.request.body.description || '',
      };
      Object.keys(ctx.request.body)
        .filter((param) => ['address', 'name', 'description'].includes(param) && ctx.request.body[param])
        .forEach((param) => { modifications[param] = ctx.request.body[param]; });

      await ctx.orm.store.update(modifications, {
        where: { id: store.id },
        individualHooks: true,
      });
      const updatedStore = await ctx.orm.store.findByPk(store.id);
      ctx.body = updatedStore;
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

module.exports = router;
