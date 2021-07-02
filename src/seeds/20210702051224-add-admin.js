module.exports = {
  up: async (queryInterface) => {
    const admin = [
      {
        id: 'af45592c-981d-4c15-b5d7-34a1a3e557fc',
        userId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('administrators', admin, {});
  },

  down: async (queryInterface) => queryInterface.bulkDelete('administrators', null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  }),
};
