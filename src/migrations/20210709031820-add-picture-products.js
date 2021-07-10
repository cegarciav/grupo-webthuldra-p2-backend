module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('products', 'picture',
    {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    }),

  down: async (queryInterface) => queryInterface.removeColumn('products', 'picture'),
};
