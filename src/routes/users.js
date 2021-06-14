const KoaRouter = require('koa-router');
const { Serializer } = require('jsonapi-serializer');
const { uuid } = require('uuidv4');
const jwtKoa = require('koa-jwt');
const { setCurrentUser } = require('../middlewares/auth');

const router = new KoaRouter();
const userSerializer = new Serializer('users', {
  attributes: ['firstName', 'lastName', 'email'],
  keyForAttributes: 'camelCase',
});

router.post('users.create', '/', async (ctx) => {
  try {
    const user = ctx.orm.user.build({
      ...ctx.request.body,
      id: uuid(),
    });
    await user.save();
    ctx.status = 201;
    ctx.body = userSerializer.serialize(user);
  } catch (e) {
    if (e.name && e.name.includes('Sequelize')) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else {
      ctx.throw(500);
    }
  }
});

router.use(jwtKoa({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(setCurrentUser);

router.param('id', async (id, ctx, next) => {
  ctx.state.user = await ctx.orm.user.findByPk(id);
  if (!ctx.state.user) ctx.throw(404, `User with id ${id} could not be found`);
  return next();
});

router.get('users.list', '/', async (ctx) => {
  const users = await ctx.orm.user.findAll();
  ctx.body = userSerializer.serialize(users);
});

router.get('users.me', '/me', async (ctx) => {
  ctx.body = userSerializer.serialize(ctx.state.currentUser);
});

router.get('users.show', '/:id', async (ctx) => {
  ctx.body = userSerializer.serialize(ctx.state.user);
});

router.patch('users.update', '/:id', async (ctx) => {
  const { currentUser, user } = ctx.state;
  try {
    if (user.id !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify user with id ${user.id}`);
    } else {
      const { password } = ctx.request.body;
      if (!password || !user.checkPassword(password)) {
        ctx.throw(401, 'You need to send your current password to modify your profile');
      }
      const { newPassword } = ctx.request.body;
      const modifications = {
        ...ctx.request.body,
        password: newPassword || user.password,
      };
      await ctx.orm.user.update(modifications, {
        where: { id: user.id },
        individualHooks: true,
      });
      const updatedUser = await ctx.orm.user.findByPk(user.id);
      ctx.body = userSerializer.serialize(updatedUser);
    }
  } catch (e) {
    if (e.name && e.name.includes('Sequelize')) {
      ctx.state.errors = e.errors;
      ctx.throw(400);
    } else {
      ctx.throw(e);
    }
  }
});

module.exports = router;
