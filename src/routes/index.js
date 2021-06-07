const KoaRouter = require('koa-router');
const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('/', async (ctx) => {
  ctx.body = {
    appVersion: pkg.version,
    title: 'Welcome to webthuldra API',
  };
});

module.exports = router;
