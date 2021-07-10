module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('users', 'picture',
    {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
      },
    }),

  down: async (queryInterface) => queryInterface.removeColumn('users', 'picture'),
};
