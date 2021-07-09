require('dotenv').config();
const KoaRouter = require('koa-router');
const jwtGenerator = require('jsonwebtoken');

const router = new KoaRouter();

function generateJWT(user) {
  return new Promise((resolve, reject) => {
    jwtGenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 60 },
      (err, token) => (err ? reject(err) : resolve(token)),
    );
  });
}

router.post('auth.login', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { email } });
  if (!user) ctx.throw(404, `No user found with email ${email}`);
  if (!await user.checkPassword(password)) ctx.throw(401, 'The password you’ve entered is incorrect');

  try {
    const token = await generateJWT(user);
    const toSendUser = { firstName: user.firstName, lastName: user.lastName, email };
    ctx.body = {
      ...toSendUser,
      accessToken: token,
      tokenType: 'Bearer',
    };
  } catch (e) {
    ctx.throw(500);
  }
});

module.exports = router;
