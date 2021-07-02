const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

router.post('comments.create', '/', async (ctx) => {
  const { currentUser } = ctx.state;
  try {
    const comment = ctx.orm.comment.build({
      ...ctx.request.body,
      id: uuid(),
      reviewerId: currentUser.id,
      storeId: ctx.params.storeId,
    });
    console.log(comment);
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await comment.save({ field: ['id', 'text', 'grade', 'reviewerId', 'storeId'] });
    ctx.status = 201;
    const completeComment = await ctx.orm.comment.findByPk(comment.id, {
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
    console.log(completeComment);
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    ctx.body = completeComment;
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
  ctx.state.comment = await ctx.orm.comment.findByPk(id);
  if (!ctx.state.comment) ctx.throw(404, `Comment with id ${id} could not be found`);
  return next();
});

router.get('comment.list', '/', async (ctx) => {
  const comments = await ctx.orm.comment.findAll({
    where: {
      storeId: ctx.params.storeId,
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

router.delete('comment.remove', '/:id', async (ctx) => {
  const { currentUser, comment } = ctx.state;
  try {
    if (comment.reviewerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to remove comment with id ${comment.id}`);
    } else {
      comment.destroy();
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
