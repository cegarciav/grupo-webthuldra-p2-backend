module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('administrators', 'createdAt',
    {
      allowNull: false,
      type: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.removeColumn('administrators', 'createdAt'),
};
