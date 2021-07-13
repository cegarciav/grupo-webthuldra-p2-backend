const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');
const { Op } = require('sequelize');
const jwtKoa = require('koa-jwt');
const { setCurrentUser } = require('../middlewares/auth');

const router = new KoaRouter();

router.post('users.create', '/', async (ctx) => {
  try {
    const user = ctx.orm.user.build({
      ...ctx.request.body,
      id: uuid(),
    });
    await user.save();
    ctx.status = 201;
    ctx.body = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    };
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
  const users = await ctx.orm.user.findAll({
    attributes: ['firstName', 'lastName', 'email', 'id'],
  });
  ctx.body = users;
});

router.get('users.me', '/me', async (ctx) => {
  const { currentUser } = ctx.state;
  ctx.body = {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    picture: currentUser.picture,
    id: currentUser.id,
  };
});

router.get('users.me.deals', '/me/deals', async (ctx) => {
  const { currentUser } = ctx.state;
  const storeIds = (await ctx.orm.store.findAll({
    where: { ownerId: currentUser.id },
  })).map((store) => store.id);
  const deals = await ctx.orm.deal.findAll({
    where: {
      [Op.or]: [
        { customerId: currentUser.id },
        { storeId: storeIds },
      ],
    },
    include: [
      {
        association: 'customer',
        attributes: ['firstName', 'lastName', 'email', 'id'],
      },
      {
        association: 'store',
        attributes: ['name', 'id'],
      },
      {
        association: 'products',
        attributes: ['name', 'price', 'unit'],
      },
    ],
  });
  ctx.body = deals;
});

router.get('users.me.comments', '/me/comments', async (ctx) => {
  const { currentUser } = ctx.state;
  const comments = await ctx.orm.comment.findAll({
    where: {
      reviewerId: currentUser.id,
    },
    include: [
      {
        association: 'store',
        attributes: ['name', 'address'],
      },
      {
        association: 'reviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });
  ctx.body = comments;
});

router.get('users.show', '/:id', async (ctx) => {
  const { user } = ctx.state;
  ctx.body = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    id: user.id,
  };
});

router.patch('users.update', '/:id', async (ctx) => {
  const { currentUser, user } = ctx.state;
  try {
    if (user.id !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify user with id ${user.id}`);
    } else {
      const { password } = ctx.request.body;
      if (!password || !await user.checkPassword(password)) {
        ctx.throw(401, 'You need to send your current password to modify your profile');
      }
      const { newPassword } = ctx.request.body;
      const picture = ctx.request.body.picture || null;
      const modifications = {
        ...ctx.request.body,
        password: newPassword || user.password,
        picture,
      };
      await ctx.orm.user.update(modifications, {
        where: { id: user.id },
        individualHooks: true,
      });
      const updatedUser = await ctx.orm.user.findByPk(user.id, {
        attributes: ['firstName', 'lastName', 'email', 'id'],
      });
      ctx.body = updatedUser;
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
