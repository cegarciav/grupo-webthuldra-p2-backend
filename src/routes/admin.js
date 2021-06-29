const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

router.post('administrator.create', '/', async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const admin = await ctx.orm.administrator.findAll({
      where: { userId: currentUser.id },
    });
    if (admin.length === 0) {
      ctx.throw(403, 'You are not allowed to create an administrator if you are not one');
    } else if (ctx.request.body.userId === currentUser.id) {
      ctx.throw(403, 'You are already an administrator');
    } else {
      const newAdmin = ctx.orm.administrator.build({
        ...ctx.request.body,
        id: uuid(),
      });
      await newAdmin.save({ field: ['userId', 'id'] });
      ctx.status = 201;
      ctx.body = newAdmin;
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
  ctx.state.administrator = await ctx.orm.administrator.findByPk(id);
  if (!ctx.state.administrator) ctx.throw(404, `Administrator with id ${id} could not be found`);
  return next();
});

router.get('administrators.list', '/', async (ctx) => {
  const administrators = await ctx.orm.administrator.findAll({
    attributes: ['userId', 'id'],
  });
  ctx.body = administrators;
});

router.delete('administrators.remove', '/:id', async (ctx) => {
  const { currentUser, administrator } = ctx.state;
  try {
    if (administrator.userId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to remove administrator with id ${administrator.id}`);
    } else {
      await administrator.destroy();
      ctx.status = 204;
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

router.delete('users.remove', '/users/:userId', async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const admin = await ctx.orm.administrator.findAll({
      where: { userId: currentUser.id },
    });
    const user = await ctx.orm.user.findByPk(ctx.params.userId);
    if (admin.length === 0) {
      ctx.throw(403, 'You are not allowed to erase an user if you are not an administrator');
    } else {
      await user.destroy();
      ctx.status = 204;
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
