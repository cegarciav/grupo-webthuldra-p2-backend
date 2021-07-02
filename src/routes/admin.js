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
    } else if (Object.is(user, null)) {
      ctx.throw(404, `User with id ${ctx.params.userId} could not be found`);
    } else {
      const stores = await ctx.orm.store.findAll({
        where: { ownerId: user.id },
      });
      await Promise.all(
        stores.map(async (store) => {
          // Estos dos siguientes tienen problemas.
          await ctx.orm.message.destroy({
            where: { senderId: store.id },
          });
          await ctx.orm.deal.destroy({
            where: { storeId: store.id },
          });
          // Estos dos anteriores tienen problemas.
          await ctx.orm.comment.destroy({
            where: { storeId: store.id },
          });
          await ctx.orm.product.destroy({
            where: { storeId: store.id },
          });
        }),
      );
      await ctx.orm.comment.destroy({
        where: { reviewerId: user.id },
      });
      await ctx.orm.message.destroy({
        where: { senderId: user.id },
      });
      await ctx.orm.deal.destroy({
        where: { customerId: user.id },
      });
      await ctx.orm.store.destroy({
        where: { ownerId: user.id },
      });
      await user.destroy();
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

router.delete('comments.remove', '/comments/:commentId', async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const admin = await ctx.orm.administrator.findAll({
      where: { userId: currentUser.id },
    });
    const comment = await ctx.orm.comment.findByPk(ctx.params.commentId);
    if (admin.length === 0) {
      ctx.throw(403, 'You are not allowed to erase a comment if you are not an administrator');
    } else if (Object.is(comment, null)) {
      ctx.throw(404, `Comment with id ${ctx.params.commentId} could not be found`);
    } else {
      await comment.destroy();
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

router.delete('stores.remove', '/stores/:storeId', async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const admin = await ctx.orm.administrator.findAll({
      where: { userId: currentUser.id },
    });
    const store = await ctx.orm.store.findByPk(ctx.params.storeId);
    if (admin.length === 0) {
      ctx.throw(403, 'You are not allowed to erase an user if you are not an administrator');
    } else if (Object.is(store, null)) {
      ctx.throw(404, `Store with id ${ctx.params.storeId} could not be found`);
    } else {
      await ctx.orm.comment.destroy({
        where: { storeId: store.id },
      });
      await ctx.orm.message.destroy({
        where: { senderId: store.id },
      });
      await ctx.orm.deal.destroy({
        where: { storeId: store.id },
      });
      await ctx.orm.product.destroy({
        where: { storeId: store.id },
      });
      await store.destroy();
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

module.exports = router;
