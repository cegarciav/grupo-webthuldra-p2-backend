require('dotenv').config();
const jwtKoa = require('koa-jwt');
const KoaRouter = require('koa-router');
const { setCurrentUser } = require('./middlewares/auth');
const index = require('./routes/index');
const users = require('./routes/users');
const stores = require('./routes/stores');
const auth = require('./routes/auth');
const products = require('./routes/products');
const deals = require('./routes/deals');
const messages = require('./routes/messages');
const admin = require('./routes/admin');
const comments = require('./routes/comments');

const router = new KoaRouter({ prefix: '/api' });

router.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.status = e.status;
    switch (e.status) {
      case 400:
        ctx.body = {
          errors: ctx.state.errors.map((error) => ({
            message: error.message, type: error.type,
          })),
        };
        break;
      case 404:
        ctx.body = {
          errors: [{
            message: e.message,
            type: 'Not Found',
          }],
        };
        break;
      case 403:
        ctx.body = {
          errors: [{
            message: e.message,
            type: 'Forbidden',
          }],
        };
        break;
      case 401:
        ctx.body = {
          errors: [{
            message: e.message,
            type: 'Unauthorised',
          }],
        };
        break;
      default:
        ctx.body = {
          errors: [{
            message: 'Unexpected Error',
            type: 'Internal Server Error',
          }],
        };
        break;
    }
  }
});

/* Unprotected routes */
router.use('/', index.routes());
router.use('/auth', auth.routes());
router.use('/users', users.routes());
router.use(jwtKoa({ secret: process.env.JWT_SECRET, key: 'authData' }).unless({ method: 'GET' }));
router.use(setCurrentUser);

/* Protected routes */
router.use('/stores', stores.routes());
router.use('/stores/:storeId/products', products.routes());
router.use('/stores/:storeId/deals', deals.routes());
router.use('/deals/:dealId/messages', messages.routes());
router.use('/admin', admin.routes());
router.use('/stores/:storeId/comments', comments.routes());

module.exports = router;
