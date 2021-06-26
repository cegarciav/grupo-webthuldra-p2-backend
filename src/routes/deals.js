const KoaRouter = require('koa-router');
const { uuid } = require('uuidv4');

const router = new KoaRouter();

async function getStore(ctx, next) {
  ctx.state.store = await ctx.orm.store.findByPk(ctx.params.storeId);
  if (!ctx.state.store) ctx.throw(404);
  return next();
}

router.post('deals.create', '/', getStore, async (ctx) => {
  const { currentUser, store } = ctx.state;
  if (store.ownerId === currentUser.id) {
    ctx.throw(403, 'You are not allowed to create a deal in your own store');
  }
  const { products } = ctx.request.body;
  if (!products || products.length === 0) {
    ctx.state.errors = [{
      message: 'Attribute products is mandatory and must have a length greater than 0',
      type: 'Missing attribute',
    }];
    ctx.throw(400);
  }
  const newId = uuid();
  let purchases;
  try {
    purchases = ctx.request.body
      .products
      .map((product) => ({
        productId: product.id,
        amount: +product.amount,
        dealId: newId,
      }))
      .reduce((list, newProduct) => {
        let isRepeated = false;
        const cleanList = [];
        list.forEach((p) => {
          if (p.productId === newProduct.productId) {
            cleanList.push({
              ...p,
              amount: p.amount + newProduct.amount,
            });
            isRepeated = true;
          } else {
            cleanList.push(p);
          }
        });
        if (!isRepeated) cleanList.push(newProduct);

        return cleanList;
      }, [])
      .filter((product) => product.productId && product.amount > 0);
    if (purchases.length === 0) throw Error();
  } catch (e) {
    ctx.state.errors = [{
      message: 'Attribute products is not properly formed. Every product must contain a valid product id and an amount',
      type: 'Wrong format',
    }];
    ctx.throw(400);
    return;
  }
  let transaction;
  try {
    transaction = await ctx.orm.sequelize.transaction();
    const deal = await ctx.orm.deal.create({
      id: newId,
      status: 'abierto',
      customerId: currentUser.id,
    }, { transaction });
    await ctx.orm.purchase.bulkCreate(purchases, { transaction });
    await transaction.commit();
    ctx.status = 201;
    const completeDeal = await ctx.orm.deal.findByPk(deal.id, {
      include: [
        {
          association: 'customer',
          attributes: ['firstName', 'lastName', 'email', 'id'],
        },
        {
          association: 'products',
          attributes: ['name', 'price', 'unit'],
        },
      ],
    });
    ctx.body = completeDeal;
  } catch (e) {
    await transaction.rollback();
    if (e.name === 'SequelizeForeignKeyConstraintError') {
      ctx.state.errors = [{
        message: 'One of the products sent does not exist',
        type: 'Foreign key error',
      }];
      ctx.throw(400);
    } else if (e.name && e.name.includes('Sequelize')) {
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
  const { status } = ctx.request.body;
  try {
    if (store.ownerId !== currentUser.id) {
      ctx.throw(403, `You are not allowed to modify deal with id ${deal.id}`);
    } else if (!status) {
      ctx.state.errors = [{
        message: 'Attribute status is mandatory',
        type: 'Missing attribute',
      }];
      ctx.throw(400);
    } else {
      await ctx.orm.deal.update({ status }, {
        where: { id: deal.id },
        individualHooks: true,
      });
      const updatedDeal = await ctx.orm.deal.findByPk(deal.id, {
        include: [
          {
            association: 'customer',
            attributes: ['firstName', 'lastName', 'email', 'id'],
          },
          {
            association: 'products',
            attributes: ['name', 'price', 'unit'],
          },
        ],
      });
      ctx.body = updatedDeal;
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
