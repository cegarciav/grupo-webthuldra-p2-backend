module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('stores', 'picture',
    {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    }),

  down: async (queryInterface) => queryInterface.removeColumn('stores', 'picture'),
};
