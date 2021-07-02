const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 10;

module.exports = {
  up: async (queryInterface) => {
    const users = [
      {
        id: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        firstName: 'Camilo',
        lastName: 'García',
        password: bcrypt.hashSync('computin', PASSWORD_SALT_ROUNDS),
        email: 'cegarciav@outlook.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        firstName: 'Carlos',
        lastName: 'Olivos',
        password: bcrypt.hashSync('brownie', PASSWORD_SALT_ROUNDS),
        email: 'cnolivos@uc.cl',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        firstName: 'Ariadna',
        lastName: 'Camino',
        password: bcrypt.hashSync('donas', PASSWORD_SALT_ROUNDS),
        email: 'ariadna.camino@uc.cl',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface) => queryInterface.bulkDelete('users', null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  }),
};
